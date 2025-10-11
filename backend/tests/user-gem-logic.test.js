import mongoose from 'mongoose';
import User from '../models/User.js';

describe('User Gem Logic', () => {
  let user;
  let quizId;
  let questionIds;

  beforeEach(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/testmancer-test');
    }

    // Create test user
    user = new User({
      googleId: 'test-google-id',
      email: 'test@example.com',
      name: 'Test User',
      gems: 0
    });
    await user.save();

    // Test data
    quizId = new mongoose.Types.ObjectId();
    questionIds = [
      new mongoose.Types.ObjectId(),
      new mongoose.Types.ObjectId(),
      new mongoose.Types.ObjectId()
    ];
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('hasEarnedGemForQuestion', () => {
    it('should return false for questions not yet earned', () => {
      const result = user.hasEarnedGemForQuestion(quizId, questionIds[0]);
      expect(result).toBe(false);
    });

    it('should return true for questions already earned', async () => {
      await user.recordEarnedGems(quizId, [questionIds[0]]);
      const result = user.hasEarnedGemForQuestion(quizId, questionIds[0]);
      expect(result).toBe(true);
    });

    it('should return false for different quiz same question id', async () => {
      const differentQuizId = new mongoose.Types.ObjectId();
      await user.recordEarnedGems(differentQuizId, [questionIds[0]]);
      const result = user.hasEarnedGemForQuestion(quizId, questionIds[0]);
      expect(result).toBe(false);
    });
  });

  describe('recordEarnedGems', () => {
    it('should create new quiz entry for first time', async () => {
      await user.recordEarnedGems(quizId, [questionIds[0]]);
      expect(user.earnedGems).toHaveLength(1);
      expect(user.earnedGems[0].quizId.toString()).toBe(quizId.toString());
      expect(user.earnedGems[0].questionIds).toHaveLength(1);
      expect(user.earnedGems[0].questionIds[0].toString()).toBe(questionIds[0].toString());
    });

    it('should append to existing quiz entry', async () => {
      await user.recordEarnedGems(quizId, [questionIds[0]]);
      await user.recordEarnedGems(quizId, [questionIds[1]]);
      expect(user.earnedGems).toHaveLength(1);
      expect(user.earnedGems[0].questionIds).toHaveLength(2);
    });

    it('should not duplicate question ids', async () => {
      await user.recordEarnedGems(quizId, [questionIds[0]]);
      await user.recordEarnedGems(quizId, [questionIds[0]]);
      expect(user.earnedGems[0].questionIds).toHaveLength(1);
    });
  });

  describe('First attempt gem logic', () => {
    it('should award gems only on first correct attempt per question', async () => {
      // First attempt - all questions correct and new
      const firstAttemptCorrect = [questionIds[0], questionIds[1], questionIds[2]];
      await user.recordEarnedGems(quizId, firstAttemptCorrect);
      expect(user.earnedGems[0].questionIds).toHaveLength(3);

      // Second attempt - only one new correct question
      const secondAttemptCorrect = [questionIds[0], questionIds[1]]; // These were already earned
      const secondAttemptNew = [new mongoose.Types.ObjectId()]; // This is new

      const newlyEarnedOnSecondAttempt = secondAttemptCorrect.filter(qid =>
        !user.hasEarnedGemForQuestion(quizId, qid)
      ).concat(secondAttemptNew);

      expect(newlyEarnedOnSecondAttempt).toHaveLength(1);

      // Record the new earnings
      await user.recordEarnedGems(quizId, newlyEarnedOnSecondAttempt);
      expect(user.earnedGems[0].questionIds).toHaveLength(4); // 3 from first + 1 new
    });
  });
});
