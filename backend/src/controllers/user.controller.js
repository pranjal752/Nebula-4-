import User from '../models/User.js';
import Submission from '../models/Submission.js';
import Problem from '../models/Problem.js';
import { sendSuccess, sendError, sendPaginated, getPaginationParams } from '../utils/response.js';

// GET /api/users/:username  — Public profile
export const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username, isActive: true })
      .select('-password -refreshTokens -email')
      .populate('solvedProblems.problem', 'title slug difficulty problemNumber');

    if (!user) return sendError(res, 'User not found.', 404);

    // Language distribution
    const langStats = await Submission.aggregate([
      { $match: { user: user._id, verdict: 'Accepted' } },
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return sendSuccess(res, { user, languageStats: langStats }, 'Profile fetched.');
  } catch (error) {
    return sendError(res, 'Failed to fetch profile.', 500);
  }
};

// PUT /api/users/profile  — Update own profile
export const updateProfile = async (req, res) => {
  try {
    const { bio, country, github, linkedin, website, avatar } = req.body;
    const allowedFields = { bio, country, github, linkedin, website, avatar };

    // Strip undefined
    Object.keys(allowedFields).forEach(
      (k) => allowedFields[k] === undefined && delete allowedFields[k]
    );

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: allowedFields },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');

    return sendSuccess(res, { user }, 'Profile updated.');
  } catch (error) {
    if (error.name === 'ValidationError') {
      return sendError(res, Object.values(error.errors)[0].message, 400);
    }
    return sendError(res, 'Failed to update profile.', 500);
  }
};

// PUT /api/users/change-password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return sendError(res, 'Current and new passwords are required.', 400);

    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword)))
      return sendError(res, 'Current password is incorrect.', 400);

    if (newPassword.length < 6)
      return sendError(res, 'Password must be at least 6 characters.', 400);

    user.password = newPassword;
    user.refreshTokens = []; // Invalidate all sessions
    await user.save();

    return sendSuccess(res, {}, 'Password updated. Please log in again.');
  } catch (error) {
    return sendError(res, 'Failed to change password.', 500);
  }
};

// GET /api/users/:username/submissions
export const getUserSubmissions = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const targetUser = await User.findOne({ username: req.params.username });
    if (!targetUser) return sendError(res, 'User not found.', 404);

    const filter = { user: targetUser._id };
    const total = await Submission.countDocuments(filter);
    const submissions = await Submission.find(filter)
      .populate('problem', 'title slug difficulty problemNumber')
      .select('-code -testResults -judgeTokens')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return sendPaginated(res, submissions, { total, page, limit, pages: Math.ceil(total / limit) });
  } catch (error) {
    return sendError(res, 'Failed to fetch submissions.', 500);
  }
};

// GET /api/users/:username/stats  — Heatmap + detailed analytics
export const getUserStats = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return sendError(res, 'User not found.', 404);

    // Submission heatmap (last 365 days)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const heatmap = await Submission.aggregate([
      {
        $match: {
          user: user._id,
          createdAt: { $gte: oneYearAgo },
          verdict: 'Accepted',
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Verdicts distribution
    const verdictDist = await Submission.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: '$verdict', count: { $sum: 1 } } },
    ]);

    // Problem solved by difficulty over time (monthly)
    const solvedByMonth = await Submission.aggregate([
      { $match: { user: user._id, verdict: 'Accepted' } },
      {
        $lookup: {
          from: 'problems',
          localField: 'problem',
          foreignField: '_id',
          as: 'problemData',
        },
      },
      { $unwind: '$problemData' },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            difficulty: '$problemData.difficulty',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);

    // Language stats
    const languageStats = await Submission.aggregate([
      { $match: { user: user._id, verdict: 'Accepted' } },
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return sendSuccess(res, {
      stats: user.stats,
      heatmap,
      verdictDistribution: verdictDist,
      solvedByMonth,
      languageStats,
    });
  } catch (error) {
    return sendError(res, 'Failed to fetch stats.', 500);
  }
};

// Admin: GET /api/users  — List all users
export const getAllUsers = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const search = req.query.search;
    const filter = search
      ? { $or: [{ username: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
      : {};

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return sendPaginated(res, users, { total, page, limit, pages: Math.ceil(total / limit) });
  } catch (error) {
    return sendError(res, 'Failed to fetch users.', 500);
  }
};
