import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { db } from '../config/db';

export async function getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
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
  } catch (error) {
    console.error('[ClauseRadar User] GetProfile error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { name, email, themePreference } = req.body;
    const user = await db.users.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const updates: any = {};
    if (name && name.trim().length > 0) {
      updates.name = name.trim();
    }

    if (email && email.trim().toLowerCase() !== user.email) {
      const cleanEmail = email.trim().toLowerCase();
      // Check if email already taken
      const existing = await db.users.findOne(u => u.email === cleanEmail && u._id !== user._id);
      if (existing) {
        res.status(409).json({ success: false, message: 'Email address is already in use by another account.' });
        return;
      }
      updates.email = cleanEmail;
    }

    if (themePreference && ['light', 'dark', 'system'].includes(themePreference)) {
      updates.themePreference = themePreference;
    }

    const updated = await db.users.findByIdAndUpdate(user._id, updates);

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updated?._id,
        name: updated?.name,
        email: updated?.email,
        themePreference: updated?.themePreference,
      },
    });
  } catch (error) {
    console.error('[ClauseRadar User] UpdateProfile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
}

export async function changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Current password and new password are required.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
      return;
    }

    if (confirmNewPassword && newPassword !== confirmNewPassword) {
      res.status(400).json({ success: false, message: 'New passwords do not match.' });
      return;
    }

    const user = await db.users.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Incorrect current password.' });
      return;
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.users.findByIdAndUpdate(user._id, { passwordHash: newHash });

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('[ClauseRadar User] ChangePassword error:', error);
    res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
}
