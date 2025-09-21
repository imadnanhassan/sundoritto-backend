import { Document, Model } from "mongoose";
import { UserRole } from "../../enum/user.enum";

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  clientInfo: {
    device: "pc" | "mobile";
    browser: string;
    ipAddress: string;
    pcName?: string;
    os?: string;
    userAgent?: string;
  };
  lastLogin: Date;
  isActive: boolean;
  otpToken?: string | null;
  createdAt: Date;
  updatedAt: Date;
}


export interface UserModel extends Model<IUser> {
  //instance methods for checking if passwords are matched
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string
  ): Promise<boolean>;
  isUserExistsByEmail(id: string): Promise<IUser>;
  checkUserExist(userId: string): Promise<IUser>;
}