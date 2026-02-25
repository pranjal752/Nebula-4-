import mongoose from 'mongoose';

const contestProblemSchema = new mongoose.Schema({
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  points: { type: Number, default: 100 },
  order: { type: Number, default: 0 },
});

const contestParticipantSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  score: { type: Number, default: 0 },
  penalty: { type: Number, default: 0 }, // total minutes
  solvedCount: { type: Number, default: 0 },
  rank: { type: Number, default: 0 },
  solvedProblems: [
    {
      problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
      solvedAt: { type: Date },
      attempts: { type: Number, default: 0 },
      timePenalty: { type: Number, default: 0 },
    },
  ],
  registeredAt: { type: Date, default: Date.now },
  lastSubmissionAt: { type: Date },
});

const contestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Contest title is required'],
      trim: true,
      unique: true,
    },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, default: '' },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: Number }, // minutes, computed
    problems: [contestProblemSchema],
    participants: [contestParticipantSchema],
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'ended'],
      default: 'upcoming',
    },
    isRated: { type: Boolean, default: true },
    isPublic: { type: Boolean, default: true },
    maxParticipants: { type: Number, default: 0 }, // 0 = unlimited
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    banner: { type: String, default: '' },
    rules: { type: String, default: '' },
    scoringType: {
      type: String,
      enum: ['icpc', 'ioi', 'custom'],
      default: 'icpc',
    },
  },
  { timestamps: true }
);

// Auto-compute status based on current time
contestSchema.virtual('currentStatus').get(function () {
  const now = new Date();
  if (now < this.startTime) return 'upcoming';
  if (now >= this.startTime && now <= this.endTime) return 'ongoing';
  return 'ended';
});

contestSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  }
  if (this.startTime && this.endTime) {
    this.duration = Math.round(
      (this.endTime - this.startTime) / (1000 * 60)
    );
  }
  next();
});

contestSchema.index({ startTime: 1, status: 1 });
contestSchema.set('toJSON', { virtuals: true });

const Contest = mongoose.model('Contest', contestSchema);
export default Contest;
