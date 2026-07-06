// controllers/adminController.js
import User from '../models/User.js';
import Session from '../models/Session.js';
import Interview from '../models/Interview.js';

// @desc    Get all users with stats
// @route   GET /api/admin/users
// @access  Admin only
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', sort = '-createdAt' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
      : {};

    const [users, total] = await Promise.all([
      User.find(filter).sort(sort).skip(skip).limit(Number(limit)).select('-password'),
      User.countDocuments(filter),
    ]);

    // Attach session count to each user
    const usersWithStats = await Promise.all(users.map(async (u) => {
      const [totalSessions, completedSessions] = await Promise.all([
        Session.countDocuments({ user: u._id }),
        Session.countDocuments({ user: u._id, status: 'completed' }),
      ]);
      return { ...u.toObject(), totalSessions, completedSessions };
    }));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: usersWithStats,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single user detail
// @route   GET /api/admin/users/:id
// @access  Admin only
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const [sessions, totalInterviews] = await Promise.all([
      Session.find({ user: user._id }).sort('-createdAt').limit(5),
      Interview.countDocuments({ user: user._id }),
    ]);

    res.json({ success: true, data: { ...user.toObject(), sessions, totalInterviews } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update user (name, email, role, targetRole)
// @route   PUT /api/admin/users/:id
// @access  Admin only
export const updateUser = async (req, res) => {
  try {
    const { name, email, targetRole, role, password } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Prevent admin from removing their own admin role
    if (req.params.id === req.user._id.toString() && role && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot remove your own admin role' });
    }

    if (name)       user.name       = name;
    if (email)      user.email      = email;
    if (targetRole) user.targetRole = targetRole;
    if (role)       user.role       = role;

    // Update password if provided
    if (password) {
      if (password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      user.password = password; // pre-save hook hashes it
    }

    await user.save();

    const updated = await User.findById(user._id).select('-password');
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete user and all their data
// @route   DELETE /api/admin/users/:id
// @access  Admin only
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    // Delete all user data
    await Interview.deleteMany({ user: user._id });
    await Session.deleteMany({ user: user._id });
    await user.deleteOne();

    res.json({ success: true, message: `User ${user.name} and all their data deleted` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get platform stats
// @route   GET /api/admin/stats
// @access  Admin only
export const getPlatformStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalSessions,
      completedSessions,
      totalInterviews,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Session.countDocuments(),
      Session.countDocuments({ status: 'completed' }),
      Interview.countDocuments(),
      User.find().sort('-createdAt').limit(5).select('name email createdAt'),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalSessions,
        completedSessions,
        totalInterviews,
        recentUsers,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create a new user (admin only)
// @route   POST /api/admin/users
// @access  Admin only
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role = 'user', targetRole = '' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password, role, targetRole });
    const created = await User.findById(user._id).select('-password');

    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};