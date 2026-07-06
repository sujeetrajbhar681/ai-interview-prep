import { validationResult } from 'express-validator';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

const userResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  targetRole: user.targetRole,
  totalSessions: user.totalSessions,
  averageScore: user.averageScore,
});

// @desc    Register
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ success: false, message: 'An account with this email already exists' });

    // Auto-promote to admin if email matches ADMIN_EMAIL in .env
    const role = email === process.env.ADMIN_EMAIL ? 'admin' : 'user';

    const user = await User.create({ name, email, password, role });
    const token = generateToken(user._id);

    res.status(201).json({ success: true, token, user: userResponse(user) });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Login
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Auto-promote to admin if email matches ADMIN_EMAIL in .env
    if (process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }

    const token = generateToken(user._id);
    res.json({ success: true, token, user: userResponse(user) });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user: { ...userResponse(user), createdAt: user.createdAt },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, targetRole } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, targetRole },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user: userResponse(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};