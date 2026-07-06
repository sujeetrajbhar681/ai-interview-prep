import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobRole: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true,
    },
    interviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Interview',
      },
    ],
    overallScore: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'abandoned'],
      default: 'in-progress',
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    answeredQuestions: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Auto-compute overallScore from linked interviews before saving
sessionSchema.pre('save', async function (next) {
  if (this.interviews.length === 0) return next();

  try {
    const Interview = mongoose.model('Interview');
    const interviews = await Interview.find({ _id: { $in: this.interviews } });
    const scored = interviews.filter((i) => i.score !== null);

    if (scored.length > 0) {
      const total = scored.reduce((sum, i) => sum + i.score, 0);
      this.overallScore = Math.round((total / scored.length) * 10) / 10;
    }

    this.answeredQuestions = interviews.filter((i) => i.answer).length;
    this.totalQuestions = interviews.length;
    next();
  } catch (err) {
    next(err);
  }
});

const Session = mongoose.model('Session', sessionSchema);
export default Session;