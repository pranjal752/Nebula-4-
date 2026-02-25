import mongoose from 'mongoose';

const testResultSchema = new mongoose.Schema({
  testCaseIndex: { type: Number },
  input: { type: String },
  expectedOutput: { type: String },
  actualOutput: { type: String },
  verdict: { type: String },
  runtime: { type: Number }, // ms
  memory: { type: Number },  // KB
  isHidden: { type: Boolean, default: false },
});

const submissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
      index: true,
    },
    contest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contest',
      default: null,
    },
    code: {
      type: String,
      required: [true, 'Code is required'],
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      enum: ['cpp', 'c', 'java', 'python3', 'javascript', 'go', 'rust', 'typescript', 'csharp', 'ruby'],
    },
    verdict: {
      type: String,
      enum: [
        'Pending',
        'Running',
        'Accepted',
        'Wrong Answer',
        'Time Limit Exceeded',
        'Memory Limit Exceeded',
        'Runtime Error',
        'Compilation Error',
      ],
      default: 'Pending',
    },
    // Overall runtime (max across test cases)
    runtime: { type: Number, default: 0 },   // ms
    memory: { type: Number, default: 0 },     // KB

    // Per test case results
    testResults: [testResultSchema],

    // Compilation error message
    compileOutput: { type: String, default: '' },

    // Error output
    stderr: { type: String, default: '' },

    // Pass count
    passedTestCases: { type: Number, default: 0 },
    totalTestCases: { type: Number, default: 0 },

    // Time spent solving (from timer)
    timeTaken: { type: Number, default: 0 }, // seconds

    // Score (for contests)
    score: { type: Number, default: 0 },

    // Judge0 token (for async polling)
    judgeTokens: [{ type: String }],

    isContest: { type: Boolean, default: false },
  },
  { timestamps: true }
);

submissionSchema.index({ user: 1, problem: 1 });
submissionSchema.index({ problem: 1, verdict: 1 });
submissionSchema.index({ contest: 1 });
submissionSchema.index({ createdAt: -1 });

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;
