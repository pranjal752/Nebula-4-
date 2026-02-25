import Problem from '../models/Problem.js';
import Submission from '../models/Submission.js';
import { sendSuccess, sendError, sendPaginated, getPaginationParams } from '../utils/response.js';
import { DEFAULT_CODE_TEMPLATES, DIFFICULTY_POINTS } from '../config/constants.js';

// GET /api/problems
export const getProblems = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { difficulty, tag, search, sortBy = 'problemNumber', order = 'asc' } = req.query;

    const filter = { isActive: true };
    if (difficulty) filter.difficulty = difficulty;
    if (tag) filter.tags = tag;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = { [sortBy]: sortOrder };

    const total = await Problem.countDocuments(filter);
    const problems = await Problem.find(filter)
      .select('-hiddenTestCases -sampleTestCases -editorial -editorialCode -codeTemplates')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    // If user is authenticated, mark solved problems
    let solvedSet = new Set();
    if (req.user) {
      solvedSet = new Set(req.user.solvedProblems.map((s) => s.problem?.toString()));
    }

    const enriched = problems.map((p) => ({
      ...p.toJSON(),
      isSolved: solvedSet.has(p._id.toString()),
    }));

    return sendPaginated(res, enriched, { total, page, limit, pages: Math.ceil(total / limit) });
  } catch (error) {
    return sendError(res, 'Failed to fetch problems.', 500);
  }
};

// GET /api/problems/:slug
export const getProblemBySlug = async (req, res) => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug, isActive: true })
      .populate('createdBy', 'username')
      .populate('relatedProblems', 'title slug difficulty problemNumber');

    if (!problem) return sendError(res, 'Problem not found.', 404);

    // Hide hidden test cases from non-admin users — show only count
    const data = problem.toJSON();
    data.hiddenTestCasesCount = problem.hiddenTestCases.length;
    delete data.hiddenTestCases;

    // Add solved status for logged-in users
    if (req.user) {
      data.isSolved = req.user.solvedProblems.some(
        (s) => s.problem?.toString() === problem._id.toString()
      );
    }

    return sendSuccess(res, { problem: data });
  } catch (error) {
    return sendError(res, 'Failed to fetch problem.', 500);
  }
};

// GET /api/problems/tags  — All unique tags
export const getAllTags = async (req, res) => {
  try {
    const tags = await Problem.distinct('tags', { isActive: true });
    return sendSuccess(res, { tags: tags.sort() });
  } catch (error) {
    return sendError(res, 'Failed to fetch tags.', 500);
  }
};

// POST /api/problems  (Admin)
export const createProblem = async (req, res) => {
  try {
    const {
      title, description, difficulty, tags, constraints,
      inputFormat, outputFormat, sampleTestCases, hiddenTestCases,
      timeLimit, memoryLimit, hints, editorial, editorialCode,
      codeTemplates, relatedProblems,
    } = req.body;

    // Auto-assign problem number
    const lastProblem = await Problem.findOne().sort({ problemNumber: -1 });
    const problemNumber = (lastProblem?.problemNumber || 0) + 1;

    // Merge custom templates with defaults (uses top-level import)
    const finalTemplates = {};
    Object.keys(DEFAULT_CODE_TEMPLATES).forEach((lang) => {
      finalTemplates[lang] = codeTemplates?.[lang] || DEFAULT_CODE_TEMPLATES[lang];
    });

    const problem = await Problem.create({
      title,
      description,
      difficulty,
      tags: tags || [],
      constraints,
      inputFormat,
      outputFormat,
      sampleTestCases: sampleTestCases || [],
      hiddenTestCases: hiddenTestCases || [],
      timeLimit: timeLimit || 2000,
      memoryLimit: memoryLimit || 256,
      hints: hints || [],
      editorial,
      editorialCode,
      codeTemplates: finalTemplates,
      relatedProblems: relatedProblems || [],
      points: DIFFICULTY_POINTS[difficulty] || 10,
      problemNumber,
      createdBy: req.user._id,
    });

    return sendSuccess(res, { problem }, 'Problem created successfully.', 201);
  } catch (error) {
    if (error.code === 11000) return sendError(res, 'A problem with this title already exists.', 409);
    if (error.name === 'ValidationError') return sendError(res, Object.values(error.errors)[0].message, 400);
    return sendError(res, 'Failed to create problem.', 500);
  }
};

// PUT /api/problems/:id  (Admin)
export const updateProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!problem) return sendError(res, 'Problem not found.', 404);
    return sendSuccess(res, { problem }, 'Problem updated.');
  } catch (error) {
    return sendError(res, 'Failed to update problem.', 500);
  }
};

// DELETE /api/problems/:id  (Admin)
export const deleteProblem = async (req, res) => {
  try {
    await Problem.findByIdAndUpdate(req.params.id, { isActive: false });
    return sendSuccess(res, {}, 'Problem deactivated.');
  } catch (error) {
    return sendError(res, 'Failed to delete problem.', 500);
  }
};

// GET /api/problems/:slug/submissions  — User's submissions for a problem
export const getProblemSubmissions = async (req, res) => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug });
    if (!problem) return sendError(res, 'Problem not found.', 404);

    const submissions = await Submission.find({
      user: req.user._id,
      problem: problem._id,
    })
      .select('-judgeTokens')
      .sort({ createdAt: -1 })
      .limit(20);

    return sendSuccess(res, { submissions });
  } catch (error) {
    return sendError(res, 'Failed to fetch submissions.', 500);
  }
};
