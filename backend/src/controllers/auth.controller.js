import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { generateAccessToken, generateRefreshToken, cookieOptions, verifyRefreshToken } from '../utils/tokenUtils.js';

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return sendError(res, `This ${field} is already registered.`, 409);
    }

    const user = await User.create({ username, email, password });
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshTokens.push(refreshToken);
    user.lastLogin = new Date();
    await user.save();

    res.cookie('accessToken', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });

    return sendSuccess(
      res,
      { user: user.toJSON(), accessToken },
      'Registration successful.',
      201
    );
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return sendError(res, messages[0], 400);
    }
    return sendError(res, 'Registration failed. Please try again.', 500);
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +refreshTokens');
    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Account has been deactivated.', 403);
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Keep only last 5 refresh tokens
    user.refreshTokens = [...(user.refreshTokens || []).slice(-4), refreshToken];
    user.lastLogin = new Date();
    await user.save();

    res.cookie('accessToken', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });

    return sendSuccess(res, { user: user.toJSON(), accessToken }, 'Login successful.');
  } catch (error) {
    return sendError(res, 'Login failed.', 500);
  }
};

// POST /api/auth/logout
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      const user = await User.findById(req.user._id).select('+refreshTokens');
      if (user) {
        user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
        await user.save();
      }
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return sendSuccess(res, {}, 'Logged out successfully.');
  } catch (error) {
    return sendError(res, 'Logout failed.', 500);
  }
};

// POST /api/auth/refresh
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body.refreshToken;
    if (!token) return sendError(res, 'Refresh token missing.', 401);

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id).select('+refreshTokens');

    if (!user || !user.refreshTokens.includes(token)) {
      return sendError(res, 'Invalid refresh token.', 401);
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    res.cookie('accessToken', newAccessToken, cookieOptions);
    res.cookie('refreshToken', newRefreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });

    return sendSuccess(res, { accessToken: newAccessToken }, 'Token refreshed.');
  } catch (error) {
    return sendError(res, 'Token refresh failed.', 401);
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('solvedProblems.problem', 'title slug difficulty');
    return sendSuccess(res, { user }, 'Profile fetched.');
  } catch (error) {
    return sendError(res, 'Failed to fetch profile.', 500);
  }
};
