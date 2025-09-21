import { IUser } from "./user.interface";
import { UserRole } from "../../enum/user.enum";
import AppError from "../../error/appError";
import { StatusCodes } from "http-status-codes";
import User from "./user.model";
import Customer from "../customer/customer.model";
import { AuthService } from "../auth/auth.service";

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

  // Login the user and return tokens
  return await AuthService.loginUser({
    email: createdUser.email,
    password: userData.password,
    clientInfo: userData.clientInfo,
  });
};

export const UserServices = {
  registerUser,
  // getAllUser,
  // myProfile,
  // updateUserStatus,
  // updateProfile,
};
