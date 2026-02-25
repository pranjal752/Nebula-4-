import User from '../models/User.js';
import { sendSuccess, sendError, sendPaginated, getPaginationParams } from '../utils/response.js';

// GET /api/leaderboard  — Global leaderboard
export const getGlobalLeaderboard = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);

    // Use same filter for total and data so pagination is consistent
    const total = await User.countDocuments({ isActive: true });
    const users = await User.find({ isActive: true })
      .select('username avatar country stats rank createdAt')
      .sort({
        'stats.totalPoints': -1,
        'stats.totalSolved': -1,
        'stats.totalSubmissions': 1,
      })
      .skip(skip)
      .limit(limit);

    // Attach rank positions
    const ranked = users.map((u, i) => ({
      ...u.toJSON(),
      rank: skip + i + 1,
    }));

    return sendPaginated(res, ranked, { total, page, limit, pages: Math.ceil(total / limit) });
  } catch (error) {
    return sendError(res, 'Failed to fetch leaderboard.', 500);
  }
};

// GET /api/leaderboard/me  — Current user's rank
export const getMyRank = async (req, res) => {
  try {
    const myPoints = req.user.stats.totalPoints;
    const mySolved = req.user.stats.totalSolved;

    // Count users ranked above
    const rank = await User.countDocuments({
      isActive: true,
      $or: [
        { 'stats.totalPoints': { $gt: myPoints } },
        {
          'stats.totalPoints': myPoints,
          'stats.totalSolved': { $gt: mySolved },
        },
      ],
    });

    return sendSuccess(res, { rank: rank + 1, stats: req.user.stats });
  } catch (error) {
    return sendError(res, 'Failed to fetch rank.', 500);
  }
};

// GET /api/leaderboard/country/:country
export const getCountryLeaderboard = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const country = req.params.country;

    const filter = { isActive: true, country: { $regex: new RegExp(`^${country}$`, 'i') } };
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('username avatar country stats createdAt')
      .sort({ 'stats.totalPoints': -1, 'stats.totalSolved': -1 })
      .skip(skip)
      .limit(limit);

    const ranked = users.map((u, i) => ({ ...u.toJSON(), rank: skip + i + 1 }));
    return sendPaginated(res, ranked, { total, page, limit, pages: Math.ceil(total / limit) });
  } catch (error) {
    return sendError(res, 'Failed to fetch country leaderboard.', 500);
  }
};
