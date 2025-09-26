import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuthService } from "./auth.service";

const loginUser = catchAsync(async (req, res) => {
  const result: any = await AuthService.loginUser(req.body);

  if (result?.twoFARequired) {
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "2FA code sent to your email",
      data: {
        twoFARequired: true,
        tempToken: result.tempToken,
      },
    });
    return;
  }

  const { refreshToken, accessToken } = result;

  res.cookie("refreshToken", refreshToken, {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User logged in successfully!",
    data: {
      accessToken,
      refreshToken,
    },
  });
});

const verify2FA = catchAsync(async (req: Request, res: Response) => {
  const { tempToken, code } = req.body;
  const result = await AuthService.verify2FA({ tempToken, code });

  res.cookie("refreshToken", result.refreshToken, {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "2FA verified, logged in",
    data: result,
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { authorization } = req.headers;

  const result = await AuthService.refreshToken(authorization as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User logged in successfully!",
    data: result,
  });
});

// change password
const changePassword = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const payload = req.body;

  await AuthService.changePassword(user, payload);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Password changed successfully!",
    data: null,
  });
});

const requestEmailVerification = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.requestEmailVerification(req.user as any);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Verification email sent",
    data: result,
  });
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { token } = req.query as { token: string };
  const result = await AuthService.verifyEmail(token);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Email verified",
    data: result,
  });
});

const enable2FA = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.enable2FA(req.user as any, { emailFor2FA: req.body.emailFor2FA });
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "2FA enabled",
    data: result,
  });
});

const disable2FA = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.disable2FA(req.user as any);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "2FA disabled",
    data: result,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await AuthService.resetPassword(payload);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Password reset successfully!",
    data: result,
  });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.forgotPassword(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "OTP sent to your email",
    data: result,
  });
});

const verifyOTP = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.verifyOTP(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "OTP verified",
    data: result,
  });
});

export const AuthController = {
  loginUser,
  verify2FA,
  refreshToken,
  changePassword,
  requestEmailVerification,
  verifyEmail,
  enable2FA,
  disable2FA,
  resetPassword,
  forgotPassword,
  verifyOTP,
};
