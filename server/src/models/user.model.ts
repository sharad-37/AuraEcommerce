/**
 * User Model — Handles user accounts and authentication credentials.
 *
 * Security decisions:
 * - Passwords are hashed with bcrypt (cost factor 12) before storage
 * - Password comparison uses bcrypt.compare (timing-attack resistant)
 * - passwordHash is excluded from JSON serialization by default
 * - Email has a unique index to prevent duplicate registrations
 *
 * Why bcrypt cost factor 12?
 * OWASP recommends a minimum of 10. Factor 12 takes ~250ms on modern hardware,
 * which is acceptable for login/registration latency but makes brute-force
 * attacks computationally expensive (~3-4 attempts/second per core).
 *
 * Why no `next` callback in the pre-save hook?
 * Mongoose 7+ supports async/await pre-hooks natively. When the function is
 * declared `async` and returns/throws, Mongoose handles flow control
 * automatically. This eliminates the TypeScript overload ambiguity around
 * the `next` parameter and produces cleaner code.
 */

import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser, UserRole } from "../types";

const SALT_ROUNDS = 12;

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CUSTOMER,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  },
);

userSchema.pre("save", async function hashPassword(): Promise<void> {
  if (!this.isModified("passwordHash")) {
    return;
  }
  this.passwordHash = await bcrypt.hash(this.passwordHash, SALT_ROUNDS);
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = model<IUser>("User", userSchema);
