import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true,
    },
    answer: {
      type: String,
      trim: true,
      default: '',
    },
    aiFeedback: {
      type: String,
      default: '',
    },
    score: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    category: {
      type: String,
      enum: ['technical', 'behavioral', 'situational', 'system-design'],
      default: 'technical',
    },
    answeredAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;