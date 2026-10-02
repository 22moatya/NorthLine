import { model, models, Schema, Types, type Model } from "mongoose";

export interface UserRecord {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: "customer" | "admin";
  failedLoginAttempts: number;
  lockedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserRecord>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["customer", "admin"], default: "customer", required: true },
    failedLoginAttempts: { type: Number, default: 0, min: 0 },
    lockedUntil: { type: Date },
  },
  { timestamps: true, versionKey: false },
);

const User = (models.User as Model<UserRecord> | undefined) ?? model<UserRecord>("User", userSchema);

export default User;