import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Quiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    let timer;
    if (quizStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizStarted, timeLeft]);

  const fetchQuiz = async () => {
    try {
      // TODO: Replace with actual API call
      // Mock data for now
      const mockQuiz = {
        id: parseInt(quizId),
        title: 'JavaScript Fundamentals Quiz',
        description: 'Test your knowledge of JavaScript basics',
        duration: 1800, // 30 minutes in seconds
        questions: [
          {
            id: 1,
            question: 'What is the correct way to declare a variable in JavaScript?',
            options: [
              'var myVariable;',
              'variable myVariable;',
              'v myVariable;',
              'declare myVariable;'
            ],
            correctAnswer: 0,
            explanation: 'In JavaScript, variables can be declared using var, let, or const keywords.'
          },
          {
            id: 2,
            question: 'Which of the following is NOT a JavaScript data type?',
            options: [
              'String',
              'Boolean',
              'Integer',
              'Undefined'
            ],
            correctAnswer: 2,
            explanation: 'JavaScript has 7 primitive data types: String, Number, Boolean, Undefined, Null, Symbol, and BigInt. Integer is not a separate data type.'
          },
          {
            id: 3,
            question: 'What will `console.log(typeof null)` output?',
            options: [
              '"null"',
              '"object"',
              '"undefined"',
              'Error'
            ],
            correctAnswer: 1,
            explanation: 'This is a well-known quirk in JavaScript. typeof null returns "object" due to a bug in the original implementation.'
          },
          {
            id: 4,
            question: 'Which method is used to add an element to the end of an array?',
            options: [
              'push()',
              'add()',
              'append()',
              'insert()'
            ],
            correctAnswer: 0,
            explanation: 'The push() method adds one or more elements to the end of an array and returns the new length of the array.'
          },
          {
            id: 5,
            question: 'What does the === operator do in JavaScript?',
            options: [
              'Assigns a value',
              'Compares values only',
              'Compares values and types',
              'Creates an object'
            ],
            correctAnswer: 2,
            explanation: 'The strict equality operator (===) compares both value and type, unlike == which performs type coercion.'
          }
        ]
      };

      setQuiz(mockQuiz);
      setTimeLeft(mockQuiz.duration);
    } catch (error) {
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (submitting) return;

    setSubmitting(true);
    try {
      // Calculate score
      let correctAnswers = 0;
      quiz.questions.forEach(question => {
        if (selectedAnswers[question.id] === question.correctAnswer) {
          correctAnswers++;
        }
      });

      const score = Math.round((correctAnswers / quiz.questions.length) * 100);

      // TODO: Submit quiz results to API
      toast.success('Quiz submitted successfully!');

      // Navigate to results page
      navigate(`/quiz/${quizId}/result`, {
        state: {
          quiz,
          selectedAnswers,
          score,
          correctAnswers,
          totalQuestions: quiz.questions.length
        }
      });
    } catch (error) {
      toast.error('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(selectedAnswers).length;
  };

  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Quiz not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The quiz you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{quiz.title}</h1>
          <p className="text-gray-600 mb-6">{quiz.description}</p>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-900">Questions:</span>
                <span className="ml-2 text-gray-600">{quiz.questions.length}</span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Duration:</span>
                <span className="ml-2 text-gray-600">{formatTime(quiz.duration)}</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="text-left">
                <h3 className="text-sm font-medium text-yellow-800">Important Notes</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Once started, the quiz timer cannot be paused</li>
                    <li>You must complete all questions before submitting</li>
                    <li>You can navigate between questions freely</li>
                    <li>Your answers are saved automatically</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={startQuiz}
            className="btn-success px-8 py-3"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Quiz Header */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900">{quiz.title}</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </div>
            <div className={`text-sm font-medium ${timeLeft < 300 ? 'text-red-600' : 'text-gray-900'}`}>
              ⏱️ {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar mb-4">
          <div
            className="progress-fill"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>

        <div className="text-sm text-gray-600">
          Answered: {getAnsweredCount()} / {quiz.questions.length}
        </div>
      </div>

      {/* Question */}
      <div className="card mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">
          {currentQuestion.question}
        </h2>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <label
              key={index}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedAnswers[currentQuestion.id] === index
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name={`question-${currentQuestion.id}`}
                value={index}
                checked={selectedAnswers[currentQuestion.id] === index}
                onChange={() => handleAnswerSelect(currentQuestion.id, index)}
                className="mr-3"
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>

        <div className="flex space-x-2">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-8 h-8 rounded-full text-sm font-medium ${
                index === currentQuestionIndex
                  ? 'bg-blue-600 text-white'
                  : selectedAnswers[quiz.questions[index].id] !== undefined
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {currentQuestionIndex === quiz.questions.length - 1 ? (
          <button
            onClick={handleSubmitQuiz}
            disabled={submitting || getAnsweredCount() !== quiz.questions.length}
            className="btn-success disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="btn-primary"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;
