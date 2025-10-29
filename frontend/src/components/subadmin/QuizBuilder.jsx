import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { MdAdd, MdDelete, MdEdit, MdClose, MdCheckCircle, MdRadioButtonUnchecked } from 'react-icons/md';
import { adminApi } from '../../utils/adminApi';

const QuizBuilder = ({
  course,
  trigger,
  moduleId,
  pageOrder,
  existingQuiz,
  onClose,
  onSave
}) => {
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    timeLimit: 30,
    passingScore: 60,
    difficulty: 'medium',
    category: 'tertiary',
    questions: []
  });
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existingQuiz) {
      setQuizForm({
        title: existingQuiz.title || '',
        description: existingQuiz.description || '',
        timeLimit: existingQuiz.timeLimit || 30,
        passingScore: existingQuiz.passingScore || 60,
        difficulty: existingQuiz.difficulty || 'medium',
        category: existingQuiz.category || 'tertiary',
        questions: existingQuiz.questions || []
      });
    }
  }, [existingQuiz]);

  const handleQuizChange = (field, value) => {
    setQuizForm(prev => ({ ...prev, [field]: value }));
  };

  const addQuestion = () => {
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      points: 1,
      difficulty: 'medium'
    });
    setShowQuestionForm(true);
  };

  const editQuestion = (index) => {
    setCurrentQuestion({ ...quizForm.questions[index], index });
    setShowQuestionForm(true);
  };

  const deleteQuestion = (index) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      setQuizForm(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index)
      }));
    }
  };

  const saveQuestion = () => {
    if (!currentQuestion.question.trim()) {
      toast.error('Question text is required');
      return;
    }

    if (currentQuestion.options.some(opt => !opt.trim())) {
      toast.error('All options must be filled');
      return;
    }

    const updatedQuestions = [...quizForm.questions];
    if (currentQuestion.index !== undefined) {
      updatedQuestions[currentQuestion.index] = currentQuestion;
    } else {
      updatedQuestions.push(currentQuestion);
    }

    setQuizForm(prev => ({ ...prev, questions: updatedQuestions }));
    setCurrentQuestion(null);
    setShowQuestionForm(false);
    toast.success('Question saved successfully');
  };

  const updateCurrentQuestion = (field, value) => {
    setCurrentQuestion(prev => ({ ...prev, [field]: value }));
  };

  const updateQuestionOption = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
  };

  const handleSaveQuiz = async () => {
    if (!quizForm.title.trim()) {
      toast.error('Quiz title is required');
      return;
    }

    if (!quizForm.description.trim()) {
      toast.error('Quiz description is required');
      return;
    }

    if (quizForm.questions.length === 0) {
      toast.error('Quiz must have at least one question');
      return;
    }

    setSaving(true);
    try {
      const quizData = {
        courseId: course._id,
        title: quizForm.title,
        description: quizForm.description,
        questions: quizForm.questions,
        trigger,
        moduleId: moduleId, // moduleId is passed for both unit and page quizzes
        pageOrder: trigger === 'page' ? pageOrder : undefined,
        timeLimit: quizForm.timeLimit,
        passingScore: quizForm.passingScore,
        difficulty: quizForm.difficulty,
        category: quizForm.category
      };

      let result;
      if (existingQuiz) {
        result = await adminApi.quizzes.updateQuiz(existingQuiz._id, quizData);
      } else {
        result = await adminApi.quizzes.createQuiz(quizData);
      }

      if (result.success) {
        toast.success(`Quiz ${existingQuiz ? 'updated' : 'created'} successfully!`);
        onSave(result.data.quiz);
        onClose();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast.error('Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  const unitLabel = course.structure?.unitLabel || 'Unit';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {existingQuiz ? 'Edit Quiz' : 'Create Quiz'}
            </h2>
            <p className="text-gray-600 mt-1">
              {trigger === 'unit'
                ? `Quiz for ${unitLabel} completion`
                : `Quiz for Page ${pageOrder}`
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <MdClose className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 min-h-0">
          {/* Quiz Form */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Quiz Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    value={quizForm.title}
                    onChange={(e) => handleQuizChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter quiz title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    value={quizForm.timeLimit}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numValue = value === '' ? '' : parseInt(value);
                      handleQuizChange('timeLimit', numValue === '' ? 30 : (isNaN(numValue) ? 30 : numValue));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={quizForm.description}
                  onChange={(e) => handleQuizChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter quiz description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={quizForm.passingScore}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numValue = value === '' ? '' : parseInt(value);
                      handleQuizChange('passingScore', numValue === '' ? 60 : (isNaN(numValue) ? 60 : numValue));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={quizForm.difficulty}
                    onChange={(e) => handleQuizChange('difficulty', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={quizForm.category}
                    onChange={(e) => handleQuizChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="secondary">Secondary</option>
                    <option value="tertiary">Tertiary</option>
                    <option value="language">Language</option>
                    <option value="professional">Professional</option>
                  </select>
                </div>
              </div>

              {/* Questions Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Questions ({quizForm.questions.length})
                  </h3>
                  <button
                    onClick={addQuestion}
                    className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
                  >
                    <MdAdd className="w-4 h-4 mr-1" />
                    Add Question
                  </button>
                </div>

                <div className="space-y-3">
                  {quizForm.questions.map((question, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {index + 1}. {question.question}
                          </h4>
                          <div className="text-sm text-gray-600">
                            Correct: {question.options[question.correctAnswer]}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => editQuestion(index)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Edit question"
                          >
                            <MdEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteQuestion(index)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete question"
                          >
                            <MdDelete className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {quizForm.questions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <MdCheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No questions added yet</p>
                      <p className="text-sm">Click "Add Question" to get started</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Question Form Sidebar */}
          {showQuestionForm && (
            <div className="w-full lg:w-96 bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentQuestion?.index !== undefined ? 'Edit Question' : 'Add Question'}
                </h3>
                <button
                  onClick={() => setShowQuestionForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <MdClose className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question *
                  </label>
                  <textarea
                    value={currentQuestion?.question || ''}
                    onChange={(e) => updateCurrentQuestion('question', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter the question"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options *
                  </label>
                  <div className="space-y-2">
                    {currentQuestion?.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateCurrentQuestion('correctAnswer', index)}
                          className={`p-1 rounded ${
                            currentQuestion.correctAnswer === index
                              ? 'text-green-600'
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          {currentQuestion.correctAnswer === index ? (
                            <MdCheckCircle className="w-4 h-4" />
                          ) : (
                            <MdRadioButtonUnchecked className="w-4 h-4" />
                          )}
                        </button>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateQuestionOption(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                          placeholder={`Option ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Click the circle to mark the correct answer
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Explanation (optional)
                  </label>
                  <textarea
                    value={currentQuestion?.explanation || ''}
                    onChange={(e) => updateCurrentQuestion('explanation', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Explain why this is the correct answer"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={saveQuestion}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Save Question
                  </button>
                  <button
                    onClick={() => setShowQuestionForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex justify-end gap-3 bg-white flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveQuiz}
            disabled={saving || quizForm.questions.length === 0}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : existingQuiz ? 'Update Quiz' : 'Create Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizBuilder;
