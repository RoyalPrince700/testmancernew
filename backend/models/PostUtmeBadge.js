import mongoose from 'mongoose';

const postUtmeBadgeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true,
    enum: ['English', 'Mathematics', 'Current-Affairs', 'General'],
    lowercase: true
  },
  badgeType: {
    type: String,
    required: true,
    enum: [
      'first-completion',
      'perfect-score',
      'speed-demon',
      'consistent-learner',
      'subject-master',
      'streak-master',
      'early-bird',
      'night-owl',
      'topic-expert',
      'milestone-achiever'
    ]
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    required: true,
    trim: true
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  points: {
    type: Number,
    required: true,
    min: 0,
    default: 10
  },
  earnedAt: {
    type: Date,
    default: Date.now
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
postUtmeBadgeSchema.index({ user: 1, subject: 1 });
postUtmeBadgeSchema.index({ user: 1, badgeType: 1 });
postUtmeBadgeSchema.index({ user: 1, earnedAt: -1 });
postUtmeBadgeSchema.index({ subject: 1, badgeType: 1 });

// Pre-save middleware
postUtmeBadgeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to get user badges summary
postUtmeBadgeSchema.statics.getUserBadgeSummary = async function(userId) {
  const pipeline = [
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$subject',
        totalBadges: { $sum: 1 },
        totalPoints: { $sum: '$points' },
        badges: {
          $push: {
            badgeType: '$badgeType',
            title: '$title',
            description: '$description',
            icon: '$icon',
            rarity: '$rarity',
            points: '$points',
            earnedAt: '$earnedAt'
          }
        }
      }
    },
    {
      $project: {
        subject: '$_id',
        totalBadges: 1,
        totalPoints: 1,
        badges: 1
      }
    }
  ];

  return this.aggregate(pipeline);
};

// Static method to check if user has badge
postUtmeBadgeSchema.statics.hasBadge = function(userId, badgeType, subject = null) {
  const query = { user: userId, badgeType };
  if (subject) {
    query.subject = subject.toLowerCase();
  }
  return this.findOne(query);
};

// Static method to award badge
postUtmeBadgeSchema.statics.awardBadge = async function(userId, subject, badgeType, title, description, icon, rarity = 'common', points = 10) {
  // Check if user already has this badge
  const existingBadge = await this.hasBadge(userId, badgeType, subject);
  if (existingBadge) {
    return existingBadge;
  }

  const badge = new this({
    user: userId,
    subject: subject.toLowerCase(),
    badgeType,
    title,
    description,
    icon,
    rarity,
    points
  });

  return badge.save();
};

// Method to get badge rarity color
postUtmeBadgeSchema.methods.getRarityColor = function() {
  const colors = {
    common: '#8B8B8B',
    rare: '#4A90E2',
    epic: '#9B59B6',
    legendary: '#F39C12'
  };
  return colors[this.rarity] || colors.common;
};

const PostUtmeBadge = mongoose.model('PostUtmeBadge', postUtmeBadgeSchema);

export default PostUtmeBadge;
