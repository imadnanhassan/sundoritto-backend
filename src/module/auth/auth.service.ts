import mongoose from "mongoose";
import { IAuth, IJwtPayload } from "./auth.interface";
import User from "../user/user.model";
import AppError from "../../error/appError";
import { StatusCodes } from "http-status-codes";
import { createToken } from "./auth.utils";

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
    hasShop: false,
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

export const AuthService = {
  loginUser,
  //   refreshToken,
  //   changePassword,
  //   forgotPassword,
  //   verifyOTP,
  //   resetPassword,
};
