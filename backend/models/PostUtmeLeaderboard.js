import mongoose from 'mongoose';

const postUtmeLeaderboardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    enum: ['English', 'Mathematics', 'Current-Affairs', 'General'],
    default: 'General',
    lowercase: true
  },
  totalScore: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  quizzesCompleted: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  averageScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },
  rank: {
    type: Number,
    min: 1
  },
  streak: {
    type: Number,
    min: 0,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  timeframe: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'all-time'],
    default: 'all-time'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
postUtmeLeaderboardSchema.index({ subject: 1, totalScore: -1, timeframe: 1 });
postUtmeLeaderboardSchema.index({ user: 1, subject: 1, timeframe: 1 }, { unique: true });
postUtmeLeaderboardSchema.index({ rank: 1, subject: 1, timeframe: 1 });
postUtmeLeaderboardSchema.index({ lastActivity: -1 });

// Pre-save middleware
postUtmeLeaderboardSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to update user leaderboard entry
postUtmeLeaderboardSchema.statics.updateUserEntry = async function(userId, subject = 'General', timeframe = 'all-time') {
  // Calculate user's stats from progress data
  const PostUtmeProgress = mongoose.model('PostUtmeProgress');

  const matchCondition = { user: userId };
  if (subject !== 'General') {
    matchCondition.subject = subject.toLowerCase();
  }

  const stats = await PostUtmeProgress.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: null,
        totalScore: { $sum: '$score' },
        quizzesCompleted: { $sum: 1 },
        averageScore: { $avg: '$score' },
        lastActivity: { $max: '$lastAttempted' }
      }
    }
  ]);

  const userStats = stats[0] || {
    totalScore: 0,
    quizzesCompleted: 0,
    averageScore: 0,
    lastActivity: new Date()
  };

  // Update or create leaderboard entry
  const entry = await this.findOneAndUpdate(
    { user: userId, subject: subject.toLowerCase(), timeframe },
    {
      totalScore: Math.round(userStats.totalScore),
      quizzesCompleted: userStats.quizzesCompleted,
      averageScore: Math.round(userStats.averageScore),
      lastActivity: userStats.lastActivity
    },
    { upsert: true, new: true }
  );

  // Update rank for this subject and timeframe
  await this.updateRanks(subject.toLowerCase(), timeframe);

  return entry;
};

// Static method to update ranks for a subject and timeframe
postUtmeLeaderboardSchema.statics.updateRanks = async function(subject, timeframe) {
  const entries = await this.find({ subject, timeframe })
    .sort({ totalScore: -1, lastActivity: -1 })
    .select('_id');

  for (let i = 0; i < entries.length; i++) {
    await this.findByIdAndUpdate(entries[i]._id, { rank: i + 1 });
  }
};

// Static method to get leaderboard
postUtmeLeaderboardSchema.statics.getLeaderboard = function(subject = 'General', timeframe = 'all-time', limit = 50) {
  return this.find({ subject: subject.toLowerCase(), timeframe })
    .populate('user', 'name avatar email')
    .sort({ totalScore: -1, lastActivity: -1 })
    .limit(limit);
};

// Static method to get user's rank
postUtmeLeaderboardSchema.statics.getUserRank = function(userId, subject = 'General', timeframe = 'all-time') {
  return this.findOne({ user: userId, subject: subject.toLowerCase(), timeframe });
};

// Static method to get top performers
postUtmeLeaderboardSchema.statics.getTopPerformers = function(subject = 'General', timeframe = 'all-time', limit = 10) {
  return this.getLeaderboard(subject, timeframe, limit);
};

const PostUtmeLeaderboard = mongoose.model('PostUtmeLeaderboard', postUtmeLeaderboardSchema);

export default PostUtmeLeaderboard;
