import Submission from '../models/Submission.js';
import Problem from '../models/Problem.js';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/response.js';

// GET /api/analytics/overview  (Admin)
export const getPlatformOverview = async (req, res) => {
  try {
    const [totalUsers, totalProblems, totalSubmissions, acceptedSubmissions] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Problem.countDocuments({ isActive: true }),
      Submission.countDocuments(),
      Submission.countDocuments({ verdict: 'Accepted' }),
    ]);

    const difficultyStats = await Problem.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
    ]);

    const langStats = await Submission.aggregate([
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const dailySubmissions = await Submission.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          accepted: {
            $sum: { $cond: [{ $eq: ['$verdict', 'Accepted'] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return sendSuccess(res, {
      totalUsers,
      totalProblems,
      totalSubmissions,
      acceptedSubmissions,
      acceptanceRate: totalSubmissions
        ? Math.round((acceptedSubmissions / totalSubmissions) * 100)
        : 0,
      difficultyStats,
      languageStats: langStats,
      dailySubmissions,
    });
  } catch (error) {
    return sendError(res, 'Failed to fetch analytics.', 500);
  }
};

// GET /api/analytics/problems  — Top attempted / hardest problems
export const getProblemAnalytics = async (req, res) => {
  try {
    const mostAttempted = await Problem.find({ isActive: true })
      .sort({ 'stats.totalSubmissions': -1 })
      .limit(10)
      .select('title slug difficulty stats problemNumber');

    const hardestProblems = await Problem.aggregate([
      { $match: { isActive: true, 'stats.totalSubmissions': { $gt: 10 } } },
      {
        $addFields: {
          acceptanceRate: {
            $cond: [
              { $eq: ['$stats.totalSubmissions', 0] },
              0,
              { $multiply: [{ $divide: ['$stats.acceptedSubmissions', '$stats.totalSubmissions'] }, 100] },
            ],
          },
        },
      },
      { $sort: { acceptanceRate: 1 } },
      { $limit: 10 },
      { $project: { title: 1, slug: 1, difficulty: 1, acceptanceRate: 1, problemNumber: 1 } },
    ]);

    return sendSuccess(res, { mostAttempted, hardestProblems });
  } catch (error) {
    return sendError(res, 'Failed to fetch problem analytics.', 500);
  }
};
