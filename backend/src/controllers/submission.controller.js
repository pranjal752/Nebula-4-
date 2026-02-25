import Submission from '../models/Submission.js';
import Problem from '../models/Problem.js';
import User from '../models/User.js';
import Contest from '../models/Contest.js';
import { sendSuccess, sendError, sendPaginated, getPaginationParams } from '../utils/response.js';
import { runAllTestCases, deriveVerdict } from '../services/judge.service.js';
import { VERDICTS, DIFFICULTY_POINTS } from '../config/constants.js';

// POST /api/submissions  — Submit code
export const submitCode = async (req, res) => {
  try {
    const { problemSlug, code, language, timeTaken, contestId } = req.body;

    if (!problemSlug || !code || !language) {
      return sendError(res, 'Problem slug, code, and language are required.', 400);
    }

    const problem = await Problem.findOne({ slug: problemSlug, isActive: true });
    if (!problem) return sendError(res, 'Problem not found.', 404);

    // Create submission in pending state
    const submission = await Submission.create({
      user: req.user._id,
      problem: problem._id,
      code,
      language,
      timeTaken: timeTaken || 0,
      verdict: VERDICTS.PENDING,
      contest: contestId || null,
      isContest: !!contestId,
    });

    // Increment problem stats
    await Problem.findByIdAndUpdate(problem._id, {
      $inc: { 'stats.totalSubmissions': 1 },
    });

    // Increment user submission count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.totalSubmissions': 1 },
    });

    // Return immediately with pending status; judge asynchronously
    res.status(202).json({
      success: true,
      message: 'Submission received. Running test cases...',
      data: { submissionId: submission._id, verdict: VERDICTS.PENDING },
    });

    // Run judge asynchronously
    runJudge(submission, problem, req.user._id, contestId).catch((err) => {
      console.error('Judge error:', err.message);
    });
  } catch (error) {
    console.error(error);
    return sendError(res, 'Failed to submit code.', 500);
  }
};

// POST /api/submissions/run  — Run code against sample test cases (no verdict save)
export const runCode = async (req, res) => {
  try {
    const { problemSlug, code, language, customInput } = req.body;

    const problem = await Problem.findOne({ slug: problemSlug, isActive: true });
    if (!problem) return sendError(res, 'Problem not found.', 404);

    const testCases = customInput
      ? [{ input: customInput, output: '', isHidden: false }]
      : problem.sampleTestCases.slice(0, 3); // run against first 3 sample cases

    const results = await runAllTestCases({
      code,
      languageKey: language,
      testCases,
      timeLimit: problem.timeLimit,
      memoryLimit: problem.memoryLimit,
    });

    return sendSuccess(res, { results });
  } catch (error) {
    console.error(error);
    return sendError(res, 'Code execution failed.', 500);
  }
};

// GET /api/submissions/:id  — Get submission details
export const getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('problem', 'title slug difficulty problemNumber')
      .populate('user', 'username avatar');

    if (!submission) return sendError(res, 'Submission not found.', 404);

    // Only owner or admin can see full code
    const isOwner = submission.user._id.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      const data = submission.toObject();
      delete data.code;
      return sendSuccess(res, { submission: data });
    }

    return sendSuccess(res, { submission });
  } catch (error) {
    return sendError(res, 'Failed to fetch submission.', 500);
  }
};

// GET /api/submissions  — All submissions (admin or own)
export const getSubmissions = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { verdict, language, problemSlug } = req.query;

    const filter = {};
    if (req.user.role !== 'admin') filter.user = req.user._id;
    if (verdict) filter.verdict = verdict;
    if (language) filter.language = language;
    if (problemSlug) {
      const problem = await Problem.findOne({ slug: problemSlug });
      if (problem) filter.problem = problem._id;
    }

    const total = await Submission.countDocuments(filter);
    const submissions = await Submission.find(filter)
      .populate('problem', 'title slug difficulty problemNumber')
      .populate('user', 'username avatar')
      .select('-code -testResults -judgeTokens')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return sendPaginated(res, submissions, { total, page, limit, pages: Math.ceil(total / limit) });
  } catch (error) {
    return sendError(res, 'Failed to fetch submissions.', 500);
  }
};

// ----- Internal judge runner -----
async function runJudge(submission, problem, userId, contestId) {
  try {
    const allTestCases = [
      ...problem.sampleTestCases,
      ...problem.hiddenTestCases.map((t) => ({ ...t.toObject(), isHidden: true })),
    ];

    const results = await runAllTestCases({
      code: submission.code,
      languageKey: submission.language,
      testCases: allTestCases,
      timeLimit: problem.timeLimit,
      memoryLimit: problem.memoryLimit,
    });

    const verdict = deriveVerdict(results);
    const compileError = results.find((r) => r.verdict === VERDICTS.COMPILATION_ERROR);
    const maxRuntime = Math.max(...results.map((r) => r.runtime || 0));
    const maxMemory = Math.max(...results.map((r) => r.memory || 0));
    const passedCount = results.filter((r) => r.verdict === VERDICTS.ACCEPTED).length;

    await Submission.findByIdAndUpdate(submission._id, {
      verdict,
      testResults: results,
      runtime: maxRuntime,
      memory: maxMemory,
      passedTestCases: passedCount,
      totalTestCases: allTestCases.length,
      compileOutput: compileError?.stderr || '',
    });

    // Update problem accepted count
    if (verdict === VERDICTS.ACCEPTED) {
      await Problem.findByIdAndUpdate(problem._id, {
        $inc: { 'stats.acceptedSubmissions': 1 },
      });

      const user = await User.findById(userId);
      const alreadySolved = user.solvedProblems.some(
        (s) => s.problem?.toString() === problem._id.toString()
      );

      if (!alreadySolved) {
        // First time solving
        await User.findByIdAndUpdate(userId, {
          $inc: {
            'stats.totalSolved': 1,
            'stats.acceptedSubmissions': 1,
            'stats.totalPoints': problem.points,
            [`stats.${problem.difficulty.toLowerCase()}Solved`]: 1,
          },
          $push: {
            solvedProblems: {
              problem: problem._id,
              language: submission.language,
              bestRuntime: maxRuntime,
              bestMemory: maxMemory,
            },
          },
          $set: { 'stats.lastActiveDate': new Date() },
        });
      } else {
        await User.findByIdAndUpdate(userId, {
          $inc: { 'stats.acceptedSubmissions': 1 },
        });
        // Update best runtime/memory
        await User.updateOne(
          { _id: userId, 'solvedProblems.problem': problem._id },
          {
            $min: {
              'solvedProblems.$.bestRuntime': maxRuntime,
              'solvedProblems.$.bestMemory': maxMemory,
            },
          }
        );
      }

      // Update streak
      await updateStreak(userId);

      // Contest scoring
      if (contestId) {
        await updateContestScore(contestId, userId, problem._id, submission._id);
      }
    } else {
      await User.findByIdAndUpdate(userId, {
        $inc: { 'stats.acceptedSubmissions': 0 },
      });
    }
  } catch (err) {
    console.error('runJudge error:', err);
    await Submission.findByIdAndUpdate(submission._id, {
      verdict: VERDICTS.RUNTIME_ERROR,
      compileOutput: err.message,
    });
  }
}

async function updateStreak(userId) {
  const user = await User.findById(userId).select('stats');
  const lastActive = user.stats.lastActiveDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!lastActive) {
    await User.findByIdAndUpdate(userId, {
      $set: { 'stats.streak': 1, 'stats.lastActiveDate': new Date() },
    });
    return;
  }

  const lastDate = new Date(lastActive);
  lastDate.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    const newStreak = user.stats.streak + 1;
    await User.findByIdAndUpdate(userId, {
      $set: {
        'stats.streak': newStreak,
        'stats.maxStreak': Math.max(newStreak, user.stats.maxStreak),
        'stats.lastActiveDate': new Date(),
      },
    });
  } else if (diffDays > 1) {
    await User.findByIdAndUpdate(userId, {
      $set: { 'stats.streak': 1, 'stats.lastActiveDate': new Date() },
    });
  }
}

async function updateContestScore(contestId, userId, problemId, submissionId) {
  const contest = await Contest.findById(contestId);
  if (!contest) return;

  const participant = contest.participants.find((p) => p.user.toString() === userId.toString());
  if (!participant) return;

  const alreadySolved = participant.solvedProblems.some(
    (s) => s.problem.toString() === problemId.toString()
  );
  if (alreadySolved) return;

  const contestProblem = contest.problems.find(
    (p) => p.problem.toString() === problemId.toString()
  );
  const pts = contestProblem?.points || 100;

  const now = new Date();
  const minutesSinceStart = Math.floor((now - contest.startTime) / 60000);

  await Contest.updateOne(
    { _id: contestId, 'participants.user': userId },
    {
      $inc: { 'participants.$.score': pts, 'participants.$.solvedCount': 1 },
      $push: {
        'participants.$.solvedProblems': {
          problem: problemId,
          solvedAt: now,
          timePenalty: minutesSinceStart,
        },
      },
      $set: { 'participants.$.lastSubmissionAt': now },
    }
  );
}
