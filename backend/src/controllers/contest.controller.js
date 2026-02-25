import Contest from '../models/Contest.js';
import Problem from '../models/Problem.js';
import Submission from '../models/Submission.js';
import User from '../models/User.js';
import { sendSuccess, sendError, sendPaginated, getPaginationParams } from '../utils/response.js';

// GET /api/contests
export const getContests = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { status } = req.query;

    const now = new Date();
    let filter = { isPublic: true };

    if (status === 'upcoming') filter.startTime = { $gt: now };
    else if (status === 'ongoing') filter.startTime = { $lte: now }, filter.endTime = { $gte: now };
    else if (status === 'ended') filter.endTime = { $lt: now };

    const total = await Contest.countDocuments(filter);
    const contests = await Contest.find(filter)
      .populate('createdBy', 'username')
      .select('-participants -problems.problem')
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit);

    // Compute live status
    const enriched = contests.map((c) => ({
      ...c.toJSON(),
      liveStatus: c.currentStatus,
      participantCount: c.participants?.length || 0,
    }));

    return sendPaginated(res, enriched, { total, page, limit, pages: Math.ceil(total / limit) });
  } catch (error) {
    return sendError(res, 'Failed to fetch contests.', 500);
  }
};

// GET /api/contests/:slug
export const getContestBySlug = async (req, res) => {
  try {
    const contest = await Contest.findOne({ slug: req.params.slug })
      .populate('problems.problem', 'title slug difficulty problemNumber tags')
      .populate('createdBy', 'username');

    if (!contest) return sendError(res, 'Contest not found.', 404);

    const data = contest.toJSON();
    data.liveStatus = contest.currentStatus;
    data.participantCount = contest.participants?.length || 0;

    // Check if user is registered
    if (req.user) {
      data.isRegistered = contest.participants.some(
        (p) => p.user?.toString() === req.user._id.toString()
      );
    }

    // Strip hidden test cases from problems
    if (data.problems) {
      data.problems = data.problems.map((p) => ({
        ...p,
        problem: p.problem,
      }));
    }

    return sendSuccess(res, { contest: data });
  } catch (error) {
    return sendError(res, 'Failed to fetch contest.', 500);
  }
};

// POST /api/contests/:id/register
export const registerForContest = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return sendError(res, 'Contest not found.', 404);

    if (contest.currentStatus === 'ended') {
      return sendError(res, 'Contest has already ended.', 400);
    }

    const already = contest.participants.find(
      (p) => p.user?.toString() === req.user._id.toString()
    );
    if (already) return sendError(res, 'Already registered for this contest.', 409);

    if (contest.maxParticipants > 0 && contest.participants.length >= contest.maxParticipants) {
      return sendError(res, 'Contest is full.', 400);
    }

    contest.participants.push({ user: req.user._id });
    await contest.save();

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { contestsParticipated: contest._id },
    });

    return sendSuccess(res, {}, 'Successfully registered for contest.');
  } catch (error) {
    return sendError(res, 'Registration failed.', 500);
  }
};

// GET /api/contests/:id/leaderboard
export const getContestLeaderboard = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate('participants.user', 'username avatar country');

    if (!contest) return sendError(res, 'Contest not found.', 404);

    const sorted = [...contest.participants]
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.penalty !== b.penalty) return a.penalty - b.penalty;
        const aLast = a.lastSubmissionAt?.getTime() || 0;
        const bLast = b.lastSubmissionAt?.getTime() || 0;
        return aLast - bLast;
      })
      .map((p, i) => ({
        rank: i + 1,
        user: p.user,
        score: p.score,
        solvedCount: p.solvedCount,
        penalty: p.penalty,
        solvedProblems: p.solvedProblems,
        lastSubmissionAt: p.lastSubmissionAt,
      }));

    return sendSuccess(res, {
      leaderboard: sorted,
      contestTitle: contest.title,
      problems: contest.problems,
    });
  } catch (error) {
    return sendError(res, 'Failed to fetch contest leaderboard.', 500);
  }
};

// POST /api/contests  (Admin)
export const createContest = async (req, res) => {
  try {
    const { title, description, startTime, endTime, problems, isRated, rules, scoringType, maxParticipants } = req.body;

    // Validate problems exist
    if (problems?.length) {
      const problemIds = problems.map((p) => p.problem);
      const exists = await Problem.countDocuments({ _id: { $in: problemIds } });
      if (exists !== problemIds.length) return sendError(res, 'One or more problems not found.', 400);
    }

    const contest = await Contest.create({
      title,
      description,
      startTime,
      endTime,
      problems: problems || [],
      isRated,
      rules,
      scoringType,
      maxParticipants: maxParticipants || 0,
      createdBy: req.user._id,
    });

    return sendSuccess(res, { contest }, 'Contest created.', 201);
  } catch (error) {
    if (error.code === 11000) return sendError(res, 'Contest title already exists.', 409);
    return sendError(res, 'Failed to create contest.', 500);
  }
};

// PUT /api/contests/:id  (Admin)
export const updateContest = async (req, res) => {
  try {
    const contest = await Contest.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!contest) return sendError(res, 'Contest not found.', 404);
    return sendSuccess(res, { contest }, 'Contest updated.');
  } catch (error) {
    return sendError(res, 'Failed to update contest.', 500);
  }
};
