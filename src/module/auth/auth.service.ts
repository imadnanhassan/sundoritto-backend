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

  // If 2FA required: generate one-time code, store with expiry, email it, return temp token
  if (user.is2FARequired && (user.twoFAEmail || user.email)) {
    const code = generateOtp();
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    user.twoFAToken = String(code);
    user.twoFAExpires = expires;
    await user.save();

    // Email code
    try {
      const { sendMail } = await import("../../config/mailer");
      await sendMail({
        to: user.twoFAEmail || user.email,
        subject: "Your 2FA code",
        text: `Your sign-in verification code is: ${code}. It expires in 5 minutes.`,
      });
    } catch {}

    const tempToken = createToken(
      { userId: String(user._id) } as any,
      process.env.jwt_otp_secret as string,
      "10m"
    );

    return {
      twoFARequired: true,
      tempToken,
    } as any;
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

const verify2FA = async (payload: { tempToken: string; code: string }) => {
  let decoded: any;
  try {
    decoded = verifyToken(payload.tempToken, process.env.jwt_otp_secret as Secret);
  } catch {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid or expired temp token");
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }
  if (!user.twoFAToken || !user.twoFAExpires || new Date() > new Date(user.twoFAExpires)) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "2FA code expired or not set");
  }
  if (String(user.twoFAToken) !== String(payload.code)) {
    throw new AppError(StatusCodes.FORBIDDEN, "Invalid 2FA code");
  }

  // Clear 2FA token
  user.twoFAToken = null as any;
  user.twoFAExpires = null as any;
  await user.save();

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

  return { accessToken, refreshToken };
};

const enable2FA = async (authUser: JwtPayload, payload: { emailFor2FA?: string }) => {
  const user = await User.findById(authUser.userId);
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User not found");

  user.is2FARequired = true;
  user.twoFAEmail = payload.emailFor2FA || user.email;
  await user.save();

  return { message: "2FA enabled", twoFAEmail: user.twoFAEmail };
};

const disable2FA = async (authUser: JwtPayload) => {
  const user = await User.findById(authUser.userId);
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User not found");

  user.is2FARequired = false;
  user.twoFAEmail = null as any;
  user.twoFAToken = null as any;
  user.twoFAExpires = null as any;
  await user.save();

  return { message: "2FA disabled" };
};

const requestEmailVerification = async (authUser: JwtPayload) => {
  const user = await User.findById(authUser.userId);
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User not found");

  const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  user.emailVerificationToken = token;
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  const verifyUrl = `${process.env.APP_URL || "http://localhost:3000"}/auth/verify-email?token=${token}`;
  try {
    const { sendMail } = await import("../../config/mailer");
    await sendMail({
      to: user.email,
      subject: "Verify your email",
      text: `Please verify your email by visiting: ${verifyUrl}`,
      html: `<p>Please verify your email by clicking <a href="${verifyUrl}">this link</a>.</p>`,
    });
  } catch {}

  return { message: "Verification email sent" };
};

const verifyEmail = async (token: string) => {
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: new Date() },
  });
  if (!user) throw new AppError(StatusCodes.BAD_REQUEST, "Invalid or expired token");

  user.isEmailVerified = true;
  user.emailVerificationToken = null as any;
  user.emailVerificationExpires = null as any;
  await user.save();

  return { message: "Email verified successfully" };
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

const forgotPassword = async ({ email }: { email: string }) => {
  const user = await User.findOne({ email });
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  if (!user.isActive) throw new AppError(StatusCodes.BAD_REQUEST, "User is not active");

  const otp = generateOtp();
  const otpToken = createToken({ otp, email } as any, process.env.jwt_otp_secret as string, "5m");

  await User.updateOne({ email }, { otpToken });

  try {
    const { sendMail } = await import("../../config/mailer");
    const { otpEmailHtml } = await import("../../utils/emailTemplates");
    const lang = (process.env.DEFAULT_LANG as "en" | "bn") || "en";
    await sendMail({
      to: email,
      subject: "Password reset verification code",
      html: otpEmailHtml(user.name, String(otp), lang),
      text: `Your password reset code: ${otp}`,
    });
  } catch {
    await User.updateOne({ email }, { $unset: { otpToken: 1 } });
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to send OTP email");
  }

  return { message: "OTP sent to your email" };
};

const verifyOTP = async ({ email, otp }: { email: string; otp: string }) => {
  const user = await User.findOne({ email });
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  if (!user.otpToken) throw new AppError(StatusCodes.BAD_REQUEST, "No OTP token found");

  let decoded: any;
  try {
    decoded = verifyToken(user.otpToken as string, process.env.jwt_otp_secret as string);
  } catch {
    throw new AppError(StatusCodes.FORBIDDEN, "OTP has expired or is invalid");
  }

  if (String(decoded.otp) !== String(otp)) {
    throw new AppError(StatusCodes.FORBIDDEN, "Invalid OTP");
  }

  // Clear otpToken
  await User.updateOne({ email }, { $unset: { otpToken: 1 } });

  const resetToken = createToken(
    { email },
    process.env.jwt_pass_reset_secret as string,
    process.env.jwt_pass_reset_expires_in as string
  );

  return { resetToken };
};

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
  verify2FA,
  enable2FA,
  disable2FA,
  requestEmailVerification,
  verifyEmail,
  refreshToken,
  changePassword,
  forgotPassword,
  verifyOTP,
  resetPassword,
};
