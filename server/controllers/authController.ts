import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../config/db';
import { signToken } from '../utils/jwt';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Full name, email, and password are required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      res.status(400).json({ success: false, message: 'Passwords do not match.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await db.users.findOne(u => u.email === cleanEmail);
    if (existing) {
      res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.users.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      themePreference: 'light',
    });

    const token = signToken({ userId: user._id, email: user.email });

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        themePreference: user.themePreference,
      },
    });
  } catch (error: any) {
    console.error('[ClauseRadar Auth] Register error:', error);
    res.status(500).json({ success: false, message: 'Registration failed due to server error.' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await db.users.findOne(u => u.email === cleanEmail);
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = signToken({ userId: user._id, email: user.email });

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        themePreference: user.themePreference || 'light',
      },
    });
  } catch (error: any) {
    console.error('[ClauseRadar Auth] Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed due to an unexpected error.' });
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const user = await db.users.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        themePreference: user.themePreference || 'light',
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('[ClauseRadar Auth] GetMe error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve user profile.' });
  }
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Email address is required.' });
      return;
    }

    const user = await db.users.findOne(u => u.email === email.trim().toLowerCase());
    if (!user) {
      // Return ambiguous message for security
      res.json({
        success: true,
        message: 'If an account matches that email, a password reset token has been generated.',
      });
      return;
    }

    // Generate secure 6-digit numeric reset token
    const token = crypto.randomInt(100000, 999999).toString();
    const expiry = Date.now() + 3600000; // 1 hour

    await db.users.findByIdAndUpdate(user._id, {
      resetToken: token,
      resetTokenExpiry: expiry,
    });

    res.json({
      success: true,
      message: 'Password reset code generated. Use this code to reset your password.',
      resetCode: token, // Provided directly in dev/demo environment as specified in requirements
    });
  } catch (error) {
    console.error('[ClauseRadar Auth] Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Error processing password reset request.' });
  }
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
      res.status(400).json({ success: false, message: 'Email, reset code, and new password are required.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
      return;
    }

    const user = await db.users.findOne(u => u.email === email.trim().toLowerCase());
    if (!user || user.resetToken !== token || !user.resetTokenExpiry || user.resetTokenExpiry < Date.now()) {
      res.status(400).json({ success: false, message: 'Invalid or expired password reset code.' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.users.findByIdAndUpdate(user._id, {
      passwordHash,
      resetToken: undefined,
      resetTokenExpiry: undefined,
    });

    res.json({ success: true, message: 'Password has been reset successfully. You may now log in.' });
  } catch (error) {
    console.error('[ClauseRadar Auth] Reset password error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
}
