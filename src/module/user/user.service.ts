import { IUser } from "./user.interface";
import { UserRole } from "../../enum/user.enum";
import AppError from "../../error/appError";
import { StatusCodes } from "http-status-codes";
import User from "./user.model";
import Customer from "../customer/customer.model";
import { AuthService } from "../auth/auth.service";
import { IJwtPayload } from "../auth/auth.interface";
import { ICustomer } from "../customer/customer.interface";
import { IImageFile } from "../../interface/IImageFile";
import { NotificationService } from "../notification/notification.service";

// Function to register user without transactions
const registerUser = async (userData: IUser) => {
  // Validate role
  if ([UserRole.ADMIN].includes(userData.role)) {
    throw new AppError(
      StatusCodes.NOT_ACCEPTABLE,
      "Invalid role. Only User is allowed."
    );
  }

  // Check if the user already exists by email
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new AppError(
      StatusCodes.NOT_ACCEPTABLE,
      "Email is already registered"
    );
  }

  // Create the user
  const user = new User(userData);
  const createdUser = await user.save();

  // Create the profile
  const profile = new Customer({
    user: createdUser._id,
  });
  await profile.save();

  // Notify admin about new customer
  await NotificationService.create("new_customer", "A new customer registered", {
    userId: String(createdUser._id),
    email: createdUser.email,
    name: createdUser.name,
  });
  // Email admin
  try {
    const { sendMail } = await import("../../config/mailer");
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    await sendMail({
      to: adminEmail,
      subject: "New customer registered",
      text: `Name: ${createdUser.name}\nEmail: ${createdUser.email}`,
    });
  } catch {
    // ignore mail errors to not block flow
  }

  // Login the user and return tokens
  return await AuthService.loginUser({
    email: createdUser.email,
    password: userData.password,
    clientInfo: userData.clientInfo,
  });
};



const myProfile = async (authUser: IJwtPayload) => {
  const isUserExists = await User.findById(authUser.userId);
  if (!isUserExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found!");
  }
  if (!isUserExists.isActive) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User is not active!");
  }

  const profile = await Customer.findOne({ user: isUserExists._id });

  return {
    ...isUserExists.toObject(),
    profile: profile || null,
  };
};


const updateProfile = async (
  payload: Partial<ICustomer>,
  file: IImageFile,
  authUser: IJwtPayload
) => {
  const isUserExists = await User.findById(authUser.userId);

  if (!isUserExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found!");
  }
  if (!isUserExists.isActive) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User is not active!");
  }

  if (file && file.path) {
    payload.photo = file.path;
  }

  const result = await Customer.findOneAndUpdate(
    { user: authUser.userId },
    payload,
    {
      new: true,
    }
  ).populate("user");

  return result;
};


const updateUserStatus = async (userId: string) => {
  const user = await User.findById(userId);

  console.log("comes here");
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User is not found");
  }

  user.isActive = !user.isActive;
  const updatedUser = await user.save();
  return updatedUser;
};

export const UserServices = {
  registerUser,
  // getAllUser,
  myProfile,
  updateUserStatus,
  updateProfile,
};
