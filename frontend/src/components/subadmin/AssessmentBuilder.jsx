import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { MdAdd, MdDelete, MdEdit, MdClose, MdCheckCircle, MdRadioButtonUnchecked, MdAssessment, MdSchool } from 'react-icons/md';

const AssessmentBuilder = ({
  course,
  trigger,
  moduleId,
  pageOrder,
  existingAssessment,
  onClose,
  onSave,
  type // 'ca' or 'exam'
}) => {
  const [assessmentForm, setAssessmentForm] = useState({
    title: '',
    description: '',
    timeLimit: type === 'exam' ? 120 : 60, // Default 2 hours for exams, 1 hour for CA
    passingScore: 40,
    totalMarks: 100,
    instructions: '',
    questions: []
  });
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existingAssessment) {
      setAssessmentForm({
        title: existingAssessment.title || '',
        description: existingAssessment.description || '',
        timeLimit: existingAssessment.timeLimit || (type === 'exam' ? 120 : 60),
        passingScore: existingAssessment.passingScore || 40,
        totalMarks: existingAssessment.totalMarks || 100,
        instructions: existingAssessment.instructions || '',
        questions: existingAssessment.questions || []
      });
    }
  }, [existingAssessment, type]);

  const handleAssessmentChange = (field, value) => {
    setAssessmentForm(prev => ({ ...prev, [field]: value }));
  };

  const addQuestion = () => {
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      marks: 1,
      questionType: 'multiple_choice'
    });
    setShowQuestionForm(true);
  };

  const editQuestion = (index) => {
    setCurrentQuestion({ ...assessmentForm.questions[index], index });
    setShowQuestionForm(true);
  };

  const deleteQuestion = (index) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      setAssessmentForm(prev => ({
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

    if (currentQuestion.question.trim().length < 10) {
      toast.error('Question must be at least 10 characters');
      return;
    }

    if (currentQuestion.questionType === 'multiple_choice' && currentQuestion.options.some(opt => !opt.trim())) {
      toast.error('All options must be filled for multiple choice questions');
      return;
    }

    const updatedQuestions = [...assessmentForm.questions];
    if (currentQuestion.index !== undefined) {
      updatedQuestions[currentQuestion.index] = currentQuestion;
    } else {
      updatedQuestions.push(currentQuestion);
    }

    setAssessmentForm(prev => ({ ...prev, questions: updatedQuestions }));
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

  const handleSaveAssessment = async () => {
    if (!assessmentForm.title.trim()) {
      toast.error(`${type.toUpperCase()} title is required`);
      return;
    }

    if (!assessmentForm.description.trim()) {
      toast.error(`${type.toUpperCase()} description is required`);
      return;
    }

    if (assessmentForm.description.trim().length < 10) {
      toast.error(`${type.toUpperCase()} description must be at least 10 characters`);
      return;
    }

    if (assessmentForm.questions.length === 0) {
      toast.error(`${type.toUpperCase()} must have at least one question`);
      return;
    }

    setSaving(true);
    try {
      // sanitize questions (drop empty optional fields)
      const sanitizedQuestions = assessmentForm.questions.map((q) => {
        const { _id, __v, index, ...rest } = q || {};
        const trimmedExplanation = (rest.explanation || '').trim();
        const cleaned = { ...rest };
        if (!trimmedExplanation) delete cleaned.explanation;
        return cleaned;
      });

      const trimmedInstructions = (assessmentForm.instructions || '').trim();

      // Build payloads differently for create vs update to match backend validation
      const baseData = {
        title: assessmentForm.title,
        description: assessmentForm.description,
        questions: sanitizedQuestions,
        trigger,
        ...(moduleId ? { moduleId } : {}),
        pageOrder: trigger === 'page' ? pageOrder : undefined,
        timeLimit: assessmentForm.timeLimit,
        passingScore: assessmentForm.passingScore,
        totalMarks: assessmentForm.totalMarks,
        ...(trimmedInstructions ? { instructions: trimmedInstructions } : {})
      };

      const assessmentData = existingAssessment
        ? baseData // For updates, DO NOT send courseId or type (not allowed by Joi)
        : { ...baseData, courseId: course._id, type, isActive: false }; // create as draft; publish later

      // Debug logs to inspect outgoing payload and context
      console.log('[AssessmentBuilder] Prepared assessment payload:', JSON.parse(JSON.stringify(assessmentData)));
      const url = existingAssessment
        ? `/api/assessments/admin/assessments/${existingAssessment._id}`
        : '/api/assessments/admin/assessments';
      console.log('[AssessmentBuilder] Request URL:', url);
      console.log('[AssessmentBuilder] Course:', course);
      console.log('[AssessmentBuilder] Trigger/module/page:', { trigger, moduleId, pageOrder });

      let result;
      if (existingAssessment) {
        result = await axios.put(`/api/assessments/admin/assessments/${existingAssessment._id}`, assessmentData);
      } else {
        result = await axios.post('/api/assessments/admin/assessments', assessmentData);
      }

      if (result.data) {
        toast.success(`${type.toUpperCase()} ${existingAssessment ? 'updated' : 'created'} successfully!`);
        onSave(result.data.assessment);
        onClose();
      } else {
        toast.error('Unknown error occurred');
      }
    } catch (error) {
      // Rich error diagnostics
      const resp = error?.response;
      console.error('[AssessmentBuilder] Error saving assessment:', error);
      if (resp) {
        console.error('[AssessmentBuilder] Response status:', resp.status);
        console.error('[AssessmentBuilder] Response headers:', resp.headers);
        console.error('[AssessmentBuilder] Response data:', resp.data);
      } else {
        console.error('[AssessmentBuilder] No response (network or proxy error)');
      }
      try {
        // Attempt to show the server-side validation message and detail
        const serverMessage = resp?.data?.message || resp?.data?.error || error.message;
        const serverDetail = resp?.data?.error || resp?.data?.details || resp?.data?.validationError;
        if (serverDetail) console.error('[AssessmentBuilder] Validation detail:', serverDetail);
        toast.error(serverMessage || `Failed to save ${type}`);
      } catch (e) {
        toast.error(`Failed to save ${type}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const unitLabel = course.structure?.unitLabel || 'Unit';
  const assessmentTypeLabel = type === 'exam' ? 'Exam' : 'CA';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {existingAssessment ? `Edit ${assessmentTypeLabel}` : `Create ${assessmentTypeLabel}`}
            </h2>
            <p className="text-gray-600 mt-1">
              {trigger === 'unit'
                ? `${assessmentTypeLabel} for ${unitLabel} completion`
                : `${assessmentTypeLabel} for Page ${pageOrder}`
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
          {/* Assessment Form */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Assessment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {assessmentTypeLabel} Title *
                  </label>
                  <input
                    type="text"
                    value={assessmentForm.title}
                    onChange={(e) => handleAssessmentChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={`Enter ${assessmentTypeLabel.toLowerCase()} title`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    value={assessmentForm.timeLimit}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numValue = value === '' ? '' : parseInt(value);
                      handleAssessmentChange('timeLimit', numValue === '' ? (type === 'exam' ? 120 : 60) : (isNaN(numValue) ? (type === 'exam' ? 120 : 60) : numValue));
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
                  value={assessmentForm.description}
                  onChange={(e) => handleAssessmentChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder={`Enter ${assessmentTypeLabel.toLowerCase()} description`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions (optional)
                </label>
                <textarea
                  value={assessmentForm.instructions}
                  onChange={(e) => handleAssessmentChange('instructions', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter instructions for students"
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
                    value={assessmentForm.passingScore}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numValue = value === '' ? '' : parseInt(value);
                      handleAssessmentChange('passingScore', numValue === '' ? 40 : (isNaN(numValue) ? 40 : numValue));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={assessmentForm.totalMarks}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numValue = value === '' ? '' : parseInt(value);
                      handleAssessmentChange('totalMarks', numValue === '' ? 100 : (isNaN(numValue) ? 100 : numValue));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <div className="flex items-center h-full">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      type === 'exam'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {type === 'exam' ? <MdSchool className="w-4 h-4 mr-1" /> : <MdAssessment className="w-4 h-4 mr-1" />}
                      {assessmentTypeLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Questions Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Questions ({assessmentForm.questions.length})
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
                  {assessmentForm.questions.map((question, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {index + 1}. {question.question}
                          </h4>
                          {question.questionType === 'multiple_choice' && (
                            <p className="text-sm text-gray-600">
                              Correct: {question.options[question.correctAnswer]}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Marks: {question.marks} | Type: {question.questionType.replace('_', ' ')}
                          </p>
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

                  {assessmentForm.questions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <MdAssessment className="w-12 h-12 mx-auto mb-4 opacity-50" />
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
                    Question Type
                  </label>
                  <select
                    value={currentQuestion?.questionType || 'multiple_choice'}
                    onChange={(e) => updateCurrentQuestion('questionType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="true_false">True/False</option>
                    <option value="short_answer">Short Answer</option>
                  </select>
                </div>

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

                {currentQuestion?.questionType === 'multiple_choice' && (
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
                )}

                {currentQuestion?.questionType === 'true_false' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correct Answer *
                    </label>
                    <select
                      value={currentQuestion?.correctAnswer || 0}
                      onChange={(e) => updateCurrentQuestion('correctAnswer', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value={0}>True</option>
                      <option value={1}>False</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marks
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={currentQuestion?.marks || 1}
                    onChange={(e) => updateCurrentQuestion('marks', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
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
            onClick={handleSaveAssessment}
            disabled={saving || assessmentForm.questions.length === 0}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : existingAssessment ? `Update ${assessmentTypeLabel}` : `Create ${assessmentTypeLabel}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentBuilder;
