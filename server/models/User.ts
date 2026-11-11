import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  themePreference?: 'light' | 'dark' | 'system';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
    themePreference: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
