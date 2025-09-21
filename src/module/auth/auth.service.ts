import mongoose from "mongoose";
import { IAuth, IJwtPayload } from "./auth.interface";
import User from "../user/user.model";
import AppError from "../../error/appError";
import { StatusCodes } from "http-status-codes";
import { createToken, verifyToken } from "./auth.utils";
import { JwtPayload, Secret } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { generateOtp } from "../../utils/generateOtp";

const loginUser = async (payload: IAuth) => {
  const user = await User.findOne({ email: payload.email });
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "This user is not found!");
  }

  if (!user.isActive) {
    throw new AppError(StatusCodes.FORBIDDEN, "This user is not active!");
  }

  if (!(await User.isPasswordMatched(payload?.password, user?.password))) {
    throw new AppError(StatusCodes.FORBIDDEN, "Password does not match");
  }

  const jwtPayload: IJwtPayload = {
    userId: user._id as string,
    name: user.name as string,
    email: user.email as string,
    isActive: user.isActive,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    process.env.JWT_ACCESS_SECRET as string,
    process.env.JWT_ACCESS_EXPIRES_IN as string
  );

  const refreshToken = createToken(
    jwtPayload,
    process.env.JWT_REFRESH_SECRET as string,
    process.env.JWT_REFRESH_EXPIRES_IN as string
  );

  // Update user info without session
  await User.findByIdAndUpdate(
    user._id,
    { clientInfo: payload.clientInfo, lastLogin: Date.now() },
    { new: true }
  );

  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string) => {
  let verifiedToken = null;
  try {
    verifiedToken = verifyToken(
      token,
      process.env.jwt_refresh_secret as Secret
    );
  } catch (err) {
    throw new AppError(StatusCodes.FORBIDDEN, "Invalid Refresh Token");
  }

  const { userId } = verifiedToken;

  const isUserExist = await User.findById(userId);
  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "User does not exist");
  }

  if (!isUserExist.isActive) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User is not active");
  }

  const jwtPayload: IJwtPayload = {
    userId: isUserExist._id as string,
    name: isUserExist.name as string,
    email: isUserExist.email as string,
    isActive: isUserExist.isActive,
    role: isUserExist.role,
  };

  const newAccessToken = createToken(
    jwtPayload,
    process.env.jwt_access_secret as Secret,
    process.env.jwt_access_expires_in as string
  );

  return {
    accessToken: newAccessToken,
  };
};

const changePassword = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string }
) => {
  const { userId } = userData;
  const { oldPassword, newPassword } = payload;

  const user = await User.findOne({ _id: userId });
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }
  if (!user.isActive) {
    throw new AppError(StatusCodes.FORBIDDEN, "User account is inactive");
  }

  // Validate old password
  const isOldPasswordCorrect = await User.isPasswordMatched(
    oldPassword,
    user.password
  );
  if (!isOldPasswordCorrect) {
    throw new AppError(StatusCodes.FORBIDDEN, "Incorrect old password");
  }

  // Hash and update the new password
  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(process.env.bcrypt_salt_rounds)
  );
  await User.updateOne({ _id: userId }, { password: hashedPassword });

  return { message: "Password changed successfully" };
};

// const forgotPassword = async ({ email }: { email: string }) => {
//   const user = await User.findOne({ email: email });

//   if (!user) {
//     throw new AppError(StatusCodes.NOT_FOUND, "User not found");
//   }

//   if (!user.isActive) {
//     throw new AppError(StatusCodes.BAD_REQUEST, "User is not active!");
//   }

//   const otp = generateOtp();

//   const otpToken = jwt.sign(
//     { otp, email },
//     process.env.jwt_otp_secret as string,
//     {
//       expiresIn: "5m",
//     }
//   );

//   await User.updateOne({ email }, { otpToken });

//   try {
//     const emailContent = await EmailHelper.createEmailContent(
//       { otpCode: otp, userName: user.name },
//       "forgotPassword"
//     );

//     await EmailHelper.sendEmail(email, emailContent, "Reset Password OTP");
//   } catch (error) {
//     await User.updateOne({ email }, { $unset: { otpToken: 1 } });

//     throw new AppError(
//       StatusCodes.INTERNAL_SERVER_ERROR,
//       "Failed to send OTP email. Please try again later."
//     );
//   }
// };

// const verifyOTP = async ({ email, otp }: { email: string; otp: string }) => {
//   const user = await User.findOne({ email: email });

//   if (!user) {
//     throw new AppError(StatusCodes.NOT_FOUND, "User not found");
//   }

//   if (!user.otpToken || user.otpToken === "") {
//     throw new AppError(
//       StatusCodes.BAD_REQUEST,
//       "No OTP token found. Please request a new password reset OTP."
//     );
//   }

//   const decodedOtpData = verifyToken(
//     user.otpToken as string,
//     process.env.jwt_otp_secret as string
//   );

//   if (!decodedOtpData) {
//     throw new AppError(StatusCodes.FORBIDDEN, "OTP has expired or is invalid");
//   }

//   if (decodedOtpData.otp !== otp) {
//     throw new AppError(StatusCodes.FORBIDDEN, "Invalid OTP");
//   }

//   user.otpToken = null;
//   await user.save();

//   const resetToken = jwt.sign(
//     { email },
//     process.env.jwt_pass_reset_secret as string,
//     {
//       expiresIn: process.env.jwt_pass_reset_expires_in,
//     }
//   );

//   // Return the reset token
//   return {
//     resetToken,
//   };
// };

const resetPassword = async ({
  token,
  newPassword,
}: {
  token: string;
  newPassword: string;
}) => {
  try {
    const decodedData = verifyToken(
      token as string,
      process.env.jwt_pass_reset_secret as string
    );

    const user = await User.findOne({
      email: decodedData.email,
      isActive: true,
    });

    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, "User not found");
    }

    const hashedPassword = await bcrypt.hash(
      String(newPassword),
      Number(process.env.bcrypt_salt_rounds)
    );

    await User.updateOne({ email: user.email }, { password: hashedPassword });

    return {
      message: "Password changed successfully",
    };
  } catch (error) {
    throw error;
  }
};

export const AuthService = {
  loginUser,
  refreshToken,
  changePassword,

  resetPassword,
};
