import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const QuizResult = () => {
  const { quizId } = useParams();
  const location = useLocation();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showExplanations, setShowExplanations] = useState({});

  useEffect(() => {
    // Prefer server-verified values; use navigation state for UX, then reconcile
    if (location.state) {
      setResult(location.state);
      setLoading(false);
      verifyAgainstHistory(location.state);
    } else {
      fetchQuizResult();
    }
  }, [quizId, location.state]);

  const verifyAgainstHistory = async (localState) => {
    try {
      const historyResponse = await axios.get('/api/quizzes/history/user');
      const quizHistory = historyResponse.data.quizHistory.find(
        h => h.quizId.toString() === quizId
      );
      if (quizHistory) {
        setResult(prev => ({
          ...(prev || localState),
          score: quizHistory.score,
          correctAnswers: quizHistory.correctAnswers,
          totalQuestions: quizHistory.totalQuestions,
          completedAt: quizHistory.completedAt
        }));
      }
    } catch (err) {
      // best-effort verification; ignore errors
    }
  };

  const fetchQuizResult = async () => {
    try {
      // Try to get quiz results from user's quiz history
      const historyResponse = await axios.get('/api/quizzes/history/user');
      const quizHistory = historyResponse.data.quizHistory.find(
        h => h.quizId.toString() === quizId
      );

      if (quizHistory) {
        // Get quiz details
        const quizResponse = await axios.get(`/api/quizzes/${quizId}`);
        const quiz = quizResponse.data.quiz;

        // Reconstruct result from history (limited data available)
        const resultData = {
          quiz: {
            id: quiz._id,
            title: quiz.title,
            questions: quiz.questions // This might not be available in history
          },
          score: quizHistory.score,
          correctAnswers: quizHistory.correctAnswers,
          totalQuestions: quizHistory.totalQuestions,
          completedAt: quizHistory.completedAt,
          // Note: gemsEarned and totalGems are not stored in history, so we'll show N/A
          gemsEarned: null,
          totalGems: null
        };

        setResult(resultData);
      } else {
        throw new Error('Quiz result not found');
      }
    } catch (error) {
      console.error('Failed to load quiz results:', error);
      toast.error('Failed to load quiz results');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const toggleExplanation = (questionId) => {
    setShowExplanations(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const getPerformanceMessage = (score) => {
    if (score >= 90) return 'Excellent! You have a strong understanding of this topic.';
    if (score >= 80) return 'Great job! You performed well on this quiz.';
    if (score >= 70) return 'Good work! You have a solid grasp of the material.';
    if (score >= 60) return 'Not bad! Consider reviewing the material and trying again.';
    return 'You might want to review the material and retake the quiz.';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Results not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The quiz results you're looking for don't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Results Header */}
      <div className="card mb-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Quiz Results</h1>
          <h2 className="text-xl text-gray-700 mb-6">{result.quiz.title}</h2>

          {/* Score Display */}
          <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreBgColor(result.score)} mb-6`}>
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
                {result.score}%
              </div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
          </div>

          {/* Gems Earned */}
          {result.gemsEarned !== null && result.totalGems !== null && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">💎</span>
                  <span className="text-lg font-semibold text-gray-900">Gems Earned</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-green-600">+{result.gemsEarned}</div>
                    <div className="text-sm text-gray-600">This Attempt</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{result.totalGems}</div>
                    <div className="text-sm text-gray-600">Total Gems</div>
                  </div>
                </div>
                {result.gemsEarned > 0 && (
                  <p className="text-sm text-green-700 mt-2">
                    🎉 Congratulations! You earned {result.gemsEarned} gem{result.gemsEarned !== 1 ? 's' : ''} for your first-attempt correct answers!
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div>
              <div className="text-2xl font-bold text-gray-900">{result.correctAnswers}</div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{result.totalQuestions - result.correctAnswers}</div>
              <div className="text-sm text-gray-600">Incorrect</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{result.totalQuestions}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>

          <p className="text-gray-600 mb-6">{getPerformanceMessage(result.score)}</p>

          <div className="text-sm text-gray-500">
            Completed on {new Date(result.completedAt).toLocaleDateString()} at {new Date(result.completedAt).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Questions Review */}
      {Array.isArray(result.questionResults) && result.questionResults.length > 0 && (
        <div className="card mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Question Review</h3>
          <div className="space-y-6">
            {result.quiz.questions.map((question, index) => {
              const questionResult = result.questionResults ? result.questionResults[index] : null;
              const userAnswer = result.selectedAnswers ? result.selectedAnswers[question.id] : (questionResult ? questionResult.userAnswer : -1);
              const isCorrect = questionResult ? questionResult.isCorrect : false;

              return (
                <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-medium text-gray-900">
                    Question {index + 1}: {question.question}
                  </h4>
                  <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {isCorrect ? (
                      <>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Correct
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Incorrect
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {question.options.map((option, optionIndex) => {
                    const isUser = optionIndex === userAnswer && !isCorrect;
                    const isAnswer = questionResult ? optionIndex === questionResult.correctAnswer : false;
                    let optionClass = 'flex items-center p-3 border rounded-lg ';
                    if (isAnswer) optionClass += 'border-green-500 bg-green-50';
                    else if (isUser) optionClass += 'border-red-500 bg-red-50';
                    else optionClass += 'border-gray-200';

                    return (
                      <div key={optionIndex} className={optionClass}>
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full mr-3 flex items-center justify-center ${
                            isAnswer ? 'bg-green-500' : isUser ? 'bg-red-500' : 'border-2 border-gray-300'
                          }`}>
                            {isAnswer && (
                              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                            {isUser && (
                              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className={isAnswer ? 'text-green-800 font-medium' : isUser ? 'text-red-800' : 'text-gray-700'}>
                            {option}
                          </span>
                          {isAnswer && (
                            <span className="ml-auto text-green-600 text-sm font-medium">✓ Correct Answer</span>
                          )}
                          {isUser && (
                            <span className="ml-auto text-red-600 text-sm font-medium">✗ Your Answer</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => toggleExplanation(question.id)}
                  className="btn-secondary text-sm"
                >
                  {showExplanations[question.id] ? 'Hide' : 'Show'} Explanation
                </button>

                {showExplanations[question.id] && questionResult && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">Explanation:</h5>
                    <p className="text-blue-800">{questionResult.explanation}</p>
                  </div>
                )}
              </div>
            );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to={`/courses/${quizId}`} className="btn-primary">
          Back to Course
        </Link>
        <Link to={`/quiz/${quizId}`} className="btn-secondary">
          Retake Quiz
        </Link>
        <Link to="/leaderboard" className="btn-secondary">
          View Leaderboard
        </Link>
      </div>
    </div>
  );
};

export default QuizResult;
