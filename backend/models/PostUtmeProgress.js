import mongoose from 'mongoose';

const postUtmeProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true,
    enum: ['English', 'Mathematics', 'Current-Affairs'],
    lowercase: true
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  subtopic: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  attempts: {
    type: Number,
    default: 0,
    min: 0
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0,
    min: 0
  },
  lastAttempted: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
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

// Compound indexes for efficient queries
postUtmeProgressSchema.index({ user: 1, subject: 1, topic: 1 });
postUtmeProgressSchema.index({ user: 1, subject: 1, completed: 1 });
postUtmeProgressSchema.index({ subject: 1, completed: 1 });
postUtmeProgressSchema.index({ user: 1, completedAt: -1 });

// Pre-save middleware
postUtmeProgressSchema.pre('save', function(next) {
  this.updatedAt = new Date();

  // Set completedAt when completed becomes true
  if (this.isModified('completed') && this.completed && !this.completedAt) {
    this.completedAt = new Date();
  }

  next();
});

// Static method to get user progress summary
postUtmeProgressSchema.statics.getUserProgressSummary = async function(userId) {
  const pipeline = [
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$subject',
        totalTopics: { $sum: 1 },
        completedTopics: {
          $sum: { $cond: ['$completed', 1, 0] }
        },
        totalScore: { $sum: '$score' },
        averageScore: { $avg: '$score' },
        totalTimeSpent: { $sum: '$timeSpent' },
        lastActivity: { $max: '$lastAttempted' }
      }
    },
    {
      $project: {
        subject: '$_id',
        totalTopics: 1,
        completedTopics: 1,
        progressPercentage: {
          $round: [{ $multiply: [{ $divide: ['$completedTopics', '$totalTopics'] }, 100] }]
        },
        totalScore: { $round: '$totalScore' },
        averageScore: { $round: '$averageScore' },
        totalTimeSpent: 1,
        lastActivity: 1
      }
    }
  ];

  return this.aggregate(pipeline);
};

// Method to get progress by subject
postUtmeProgressSchema.statics.getSubjectProgress = function(userId, subject) {
  return this.find({ user: userId, subject: subject.toLowerCase() });
};

// Method to mark topic as completed
postUtmeProgressSchema.statics.completeTopic = async function(userId, subject, topic, subtopic, score, timeSpent) {
  const updateData = {
    completed: true,
    score: score,
    timeSpent: timeSpent,
    lastAttempted: new Date(),
    completedAt: new Date(),
    $inc: { attempts: 1 }
  };

  return this.findOneAndUpdate(
    { user: userId, subject: subject.toLowerCase(), topic, subtopic },
    updateData,
    { upsert: true, new: true }
  );
};

const PostUtmeProgress = mongoose.model('PostUtmeProgress', postUtmeProgressSchema);

export default PostUtmeProgress;
