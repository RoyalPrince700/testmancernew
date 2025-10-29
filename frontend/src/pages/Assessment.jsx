import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Assessment = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  useEffect(() => {
    fetchAssessment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId]);

  // Auto-start when "start=1" is present in query string
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('start') === '1') {
      setStarted(true);
    }
  }, [location.search]);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/assessments/${assessmentId}`);
      setAssessment(res.data.assessment);
    } catch (error) {
      console.error('Failed to load assessment:', error);
      toast.error('Failed to load assessment');
    } finally {
      setLoading(false);
    }
  };

  const startAssessment = () => setStarted(true);

  const handleSelect = (qId, value) => {
    setSelectedAnswers(prev => ({ ...prev, [qId]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="card text-center">
          <h2 className="text-xl font-semibold text-gray-900">Assessment not found</h2>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900">{assessment.title}</h1>
          <p className="text-gray-600 mt-2">{assessment.description}</p>
          <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
            <div>
              <span className="font-medium text-gray-900">Course:</span>
              <span className="ml-2 text-gray-700">{(assessment.courseId?.courseCode || assessment.courseId?.title || 'UNKNOWN').toUpperCase?.() || (assessment.courseId?.title || 'Unknown')}</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Type:</span>
              <span className="ml-2 text-gray-700">{assessment.type === 'exam' ? 'Exam' : 'CA'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Questions:</span>
              <span className="ml-2 text-gray-700">{assessment.questions?.length || 0}</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Time Limit:</span>
              <span className="ml-2 text-gray-700">{assessment.timeLimit} min</span>
            </div>
          </div>
          {assessment.instructions && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
              <div className="font-medium mb-1">Instructions</div>
              <div>{assessment.instructions}</div>
            </div>
          )}
          <div className="mt-8">
            <button className="btn-success px-6 py-2" onClick={startAssessment}>Start</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="card">
        <h1 className="text-xl font-semibold text-gray-900 mb-4">{assessment.title}</h1>
        <div className="space-y-6">
          {assessment.questions.map((q, idx) => (
            <div key={q._id || idx} className="border rounded-lg p-4">
              <div className="font-medium text-gray-900 mb-2">{idx + 1}. {q.question}</div>
              {q.questionType === 'multiple_choice' && (
                <div className="space-y-2">
                  {q.options.map((opt, i) => (
                    <label key={i} className={`flex items-center p-3 border rounded-lg cursor-pointer ${selectedAnswers[q._id] === i ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input
                        type="radio"
                        name={`q-${q._id}`}
                        value={i}
                        checked={selectedAnswers[q._id] === i}
                        onChange={() => handleSelect(q._id, i)}
                        className="mr-3"
                      />
                      <span className="text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              )}
              {q.questionType === 'true_false' && (
                <div className="space-y-2">
                  {[0,1].map((val) => (
                    <label key={val} className={`flex items-center p-3 border rounded-lg cursor-pointer ${selectedAnswers[q._id] === val ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input
                        type="radio"
                        name={`q-${q._id}`}
                        value={val}
                        checked={selectedAnswers[q._id] === val}
                        onChange={() => handleSelect(q._id, val)}
                        className="mr-3"
                      />
                      <span className="text-gray-700">{val === 0 ? 'True' : 'False'}</span>
                    </label>
                  ))}
                </div>
              )}
              {q.questionType === 'short_answer' && (
                <input
                  type="text"
                  value={selectedAnswers[q._id] || ''}
                  onChange={(e) => handleSelect(q._id, e.target.value)}
                  placeholder="Your answer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            className="btn-primary"
            onClick={async () => {
              try {
                // Build answers array in question order
                const answers = assessment.questions.map((q) => selectedAnswers[q._id]);
                const res = await axios.post(`/api/assessments/${assessmentId}/submit`, { answers });
                toast.success(`Submitted! Score: ${res.data.score}%`);
                navigate('/dashboard?tab=results');
              } catch (error) {
                console.error('Failed to submit assessment:', error);
                toast.error(error?.response?.data?.message || 'Failed to submit assessment');
              }
            }}
          >
            Submit Assessment
          </button>
        </div>
      </div>
    </div>
  );
};

export default Assessment;


