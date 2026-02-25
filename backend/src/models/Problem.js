import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema({
  input: { type: String, default: '' },
  output: { type: String, default: '' },  // empty string is valid (e.g. empty output edge cases)
  isHidden: { type: Boolean, default: false },
  explanation: { type: String, default: '' },
});

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Problem title is required'],
      trim: true,
      unique: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    problemNumber: {
      type: Number,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Problem description is required'],
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: [true, 'Difficulty level is required'],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    constraints: { type: String, default: '' },
    inputFormat: { type: String, default: '' },
    outputFormat: { type: String, default: '' },
    sampleTestCases: [testCaseSchema],
    hiddenTestCases: [testCaseSchema],

    // Code starter templates per language
    codeTemplates: {
      cpp: { type: String, default: '' },
      c: { type: String, default: '' },
      java: { type: String, default: '' },
      python3: { type: String, default: '' },
      javascript: { type: String, default: '' },
      go: { type: String, default: '' },
      rust: { type: String, default: '' },
      typescript: { type: String, default: '' },
      csharp: { type: String, default: '' },
      ruby: { type: String, default: '' },
    },

    // Hints (revealed progressively)
    hints: [{ type: String }],

    // Editorial / Solution explanation
    editorial: { type: String, default: '' },
    editorialCode: {
      language: { type: String, default: 'cpp' },
      code: { type: String, default: '' },
    },

    // Time & Memory limits
    timeLimit: { type: Number, default: 2000 }, // ms
    memoryLimit: { type: Number, default: 256 }, // MB

    // Stats
    stats: {
      totalSubmissions: { type: Number, default: 0 },
      acceptedSubmissions: { type: Number, default: 0 },
      totalAttempts: { type: Number, default: 0 }, // unique users
    },

    // Points awarded
    points: { type: Number, default: 10 },

    // Related problems
    relatedProblems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],

    isActive: { type: Boolean, default: true },
    isPremium: { type: Boolean, default: false },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Auto-generate slug from title
problemSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

// Virtual: acceptance rate
problemSchema.virtual('acceptanceRate').get(function () {
  if (this.stats.totalSubmissions === 0) return 0;
  return Math.round(
    (this.stats.acceptedSubmissions / this.stats.totalSubmissions) * 100
  );
});

problemSchema.set('toJSON', { virtuals: true });
problemSchema.set('toObject', { virtuals: true });

// Index for fast queries (slug & problemNumber already indexed via unique:true)
problemSchema.index({ difficulty: 1, isActive: 1 });
problemSchema.index({ tags: 1 });

const Problem = mongoose.model('Problem', problemSchema);
export default Problem;
