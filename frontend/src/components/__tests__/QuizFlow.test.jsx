import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Quiz from '../../pages/Quiz';
import QuizResult from '../../pages/QuizResult';
import { mockAuthContext } from '../../test-setup';

// Mock the API calls
jest.mock('../../utils/adminApi', () => ({
  createQuiz: jest.fn(),
  getQuiz: jest.fn(),
  submitQuiz: jest.fn()
}));

const mockAdminApi = require('../../utils/adminApi');

describe('Quiz Flow UI Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Quiz Creation (Subadmin)', () => {
    it('should create unit-triggered quiz', async () => {
      mockAdminApi.createQuiz.mockResolvedValueOnce({
        data: {
          quiz: {
            _id: 'test-quiz-id',
            title: 'Unit Quiz',
            trigger: 'unit',
            questions: []
          }
        }
      });

      render(
        <div>
          {/* Assuming QuizBuilder component exists */}
          <div data-testid="quiz-builder">
            <input placeholder="Quiz Title" data-testid="quiz-title" />
            <select data-testid="trigger-select">
              <option value="unit">Unit</option>
              <option value="page">Page</option>
            </select>
            <button data-testid="create-quiz">Create Quiz</button>
          </div>
        </div>
      );

      await user.type(screen.getByTestId('quiz-title'), 'Unit Quiz');
      await user.selectOptions(screen.getByTestId('trigger-select'), 'unit');

      const createButton = screen.getByTestId('create-quiz');
      await user.click(createButton);

      await waitFor(() => {
        expect(mockAdminApi.createQuiz).toHaveBeenCalledWith({
          title: 'Unit Quiz',
          trigger: 'unit',
          moduleId: expect.any(String),
          questions: []
        });
      });
    });

    it('should create page-triggered quiz with page order', async () => {
      mockAdminApi.createQuiz.mockResolvedValueOnce({
        data: {
          quiz: {
            _id: 'test-page-quiz-id',
            title: 'Page Quiz',
            trigger: 'page',
            pageOrder: 1
          }
        }
      });

      render(
        <div>
          <div data-testid="quiz-builder">
            <input placeholder="Quiz Title" data-testid="quiz-title" />
            <select data-testid="trigger-select">
              <option value="unit">Unit</option>
              <option value="page">Page</option>
            </select>
            <input type="number" placeholder="Page Order" data-testid="page-order" />
            <button data-testid="create-quiz">Create Quiz</button>
          </div>
        </div>
      );

      await user.type(screen.getByTestId('quiz-title'), 'Page Quiz');
      await user.selectOptions(screen.getByTestId('trigger-select'), 'page');
      await user.type(screen.getByTestId('page-order'), '1');

      const createButton = screen.getByTestId('create-quiz');
      await user.click(createButton);

      await waitFor(() => {
        expect(mockAdminApi.createQuiz).toHaveBeenCalledWith({
          title: 'Page Quiz',
          trigger: 'page',
          moduleId: expect.any(String),
          pageOrder: 1,
          questions: []
        });
      });
    });
  });

  describe('Quiz Taking Flow', () => {
    const mockQuiz = {
      _id: 'quiz1',
      title: 'Test Quiz',
      description: 'A test quiz',
      questions: [
        {
          _id: 'q1',
          question: 'What is 2+2?',
          options: ['3', '4', '5', '6'],
          correctAnswer: 1,
          points: 1
        },
        {
          _id: 'q2',
          question: 'What is 3+3?',
          options: ['5', '6', '7', '8'],
          correctAnswer: 1,
          points: 1
        }
      ],
      trigger: 'unit'
    };

    beforeEach(() => {
      mockAdminApi.getQuiz.mockResolvedValueOnce({ data: { quiz: mockQuiz } });
    });

    it('should display quiz questions and options', async () => {
      render(
        <div>
          <Quiz />
        </div>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Quiz')).toBeInTheDocument();
        expect(screen.getByText('What is 2+2?')).toBeInTheDocument();
        expect(screen.getByText('What is 3+3?')).toBeInTheDocument();
      });

      // Check if options are displayed
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
    });

    it('should allow user to select answers and submit', async () => {
      mockAdminApi.submitQuiz.mockResolvedValueOnce({
        data: {
          score: 100,
          correctAnswers: 2,
          totalQuestions: 2,
          gemsEarned: 2,
          totalGems: 2,
          passed: true,
          questionResults: []
        }
      });

      render(
        <div>
          <Quiz />
        </div>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Quiz')).toBeInTheDocument();
      });

      // Select answers for both questions
      const optionButtons = screen.getAllByRole('button', { name: /4|6/ });
      await user.click(optionButtons[1]); // Select '4' for first question
      await user.click(optionButtons[3]); // Select '6' for second question

      // Submit quiz
      const submitButton = screen.getByRole('button', { name: /Submit Quiz/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAdminApi.submitQuiz).toHaveBeenCalledWith('quiz1', [1, 1]);
      });
    });
  });

  describe('Quiz Results Display', () => {
    const mockResults = {
      score: 100,
      correctAnswers: 2,
      totalQuestions: 2,
      gemsEarned: 2,
      totalGems: 5,
      passed: true,
      questionResults: [
        {
          questionId: 'q1',
          userAnswer: 1,
          correctAnswer: 1,
          isCorrect: true,
          points: 1
        },
        {
          questionId: 'q2',
          userAnswer: 1,
          correctAnswer: 1,
          isCorrect: true,
          points: 1
        }
      ]
    };

    it('should display quiz results with gem information', () => {
      render(
        <div>
          <QuizResult results={mockResults} />
        </div>
      );

      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('2/2')).toBeInTheDocument();
      expect(screen.getByText('2 gems earned')).toBeInTheDocument();
      expect(screen.getByText('Total: 5 gems')).toBeInTheDocument();
    });

    it('should show attempt-specific vs lifetime gems', () => {
      render(
        <div>
          <QuizResult results={mockResults} />
        </div>
      );

      expect(screen.getByText(/This attempt:/i)).toBeInTheDocument();
      expect(screen.getByText(/Lifetime:/i)).toBeInTheDocument();
    });

    it('should handle partial correct answers', () => {
      const partialResults = {
        ...mockResults,
        score: 50,
        correctAnswers: 1,
        gemsEarned: 1,
        totalGems: 3,
        questionResults: [
          {
            questionId: 'q1',
            userAnswer: 1,
            correctAnswer: 1,
            isCorrect: true,
            points: 1
          },
          {
            questionId: 'q2',
            userAnswer: 0,
            correctAnswer: 1,
            isCorrect: false,
            points: 0
          }
        ]
      };

      render(
        <div>
          <QuizResult results={partialResults} />
        </div>
      );

      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getByText('1/2')).toBeInTheDocument();
      expect(screen.getByText('1 gems earned')).toBeInTheDocument();
      expect(screen.getByText('Total: 3 gems')).toBeInTheDocument();
    });
  });

  describe('Repeat Quiz Attempts', () => {
    it('should show no gems earned on repeat attempts for same questions', async () => {
      const repeatResults = {
        score: 100,
        correctAnswers: 2,
        totalQuestions: 2,
        gemsEarned: 0, // No new gems
        totalGems: 5, // But total gems remain
        passed: true,
        questionResults: []
      };

      render(
        <div>
          <QuizResult results={repeatResults} />
        </div>
      );

      expect(screen.getByText('0 gems earned')).toBeInTheDocument();
      expect(screen.getByText('Total: 5 gems')).toBeInTheDocument();
      expect(screen.getByText(/No new gems earned/i)).toBeInTheDocument();
    });
  });
});
