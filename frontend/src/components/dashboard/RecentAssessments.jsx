import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MdAssessment, MdSchool, MdSchedule, MdCheckCircle } from 'react-icons/md';
import axios from 'axios';
import toast from 'react-hot-toast';
import Card from '../ui/Card';

const RecentAssessments = ({ recentAssessments = [] }) => {
  const [caAssessments, setCaAssessments] = useState([]);
  const [examAssessments, setExamAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use provided data if available, otherwise fetch
    if (recentAssessments && recentAssessments.length > 0) {
      // Assume recentAssessments contains both CA and exam data
      const ca = recentAssessments.filter(a => a.type === 'ca' || a.assessmentType === 'ca');
      const exams = recentAssessments.filter(a => a.type === 'exam' || a.assessmentType === 'exam');
      setCaAssessments(ca);
      setExamAssessments(exams);
      setLoading(false);
    } else {
      fetchRecentAssessments();
    }
  }, [recentAssessments]);

  const fetchRecentAssessments = async () => {
    try {
      setLoading(true);
      const [caRes, examRes] = await Promise.all([
        axios.get('/api/assessments/type/ca'),
        axios.get('/api/assessments/type/exam')
      ]);
      setCaAssessments(caRes.data.assessments || []);
      setExamAssessments(examRes.data.assessments || []);
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
      toast.error('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const getAssessmentTypeIcon = (type) => {
    return type === 'exam' ? (
      <MdSchool className="w-5 h-5 text-red-500" />
    ) : (
      <MdAssessment className="w-5 h-5 text-blue-500" />
    );
  };

  const getAssessmentTypeLabel = (type) => {
    return type === 'exam' ? 'Exam' : 'CA';
  };

  const formatTimeLimit = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <Card className="p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">CA / Exam</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-16 rounded-lg"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6">
      <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">CA / Exam</h2>

      {caAssessments.length === 0 && examAssessments.length === 0 ? (
        <div className="text-center py-6">
          <div className="mb-3">
            <MdAssessment className="mx-auto h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">No assessments found.</p>
          <p className="text-gray-400 text-xs mt-1">Check back later for new assignments.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {caAssessments.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Continuous Assessment (CA)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {caAssessments.map((assessment) => (
                  <div key={assessment._id} className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm hover:border-gray-300 transition sm:min-h-[170px] min-h-[140px] flex flex-col">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-sm font-bold text-gray-900 tracking-wide uppercase">
                        <span className="inline-flex w-6 h-6 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                          <MdAssessment className="w-4 h-4" />
                        </span>
                        {(assessment.courseId?.courseCode || assessment.course?.courseCode || 'UNKNOWN COURSE').toUpperCase()}
                      </div>
                      { (assessment.courseId?.title || assessment.course?.title) && (
                        <div className="mt-1 text-[11px] text-gray-500 truncate px-2">{assessment.courseId?.title || assessment.course?.title}</div>
                      )}
                      <div className="mt-2 flex items-center justify-center gap-3 text-[11px] text-gray-600">
                        <span className="inline-flex items-center gap-1">
                          <MdSchedule className="w-3 h-3" /> {formatTimeLimit(assessment.timeLimit)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MdCheckCircle className="w-3 h-3" /> {(assessment.questions?.length || 0)} Qs
                        </span>
                      </div>
                    </div>
                    <div className="mt-auto pt-3">
                      <div className="flex gap-2">
                        <Link
                          to={`/assessment/${assessment._id}`}
                          className="flex-1 inline-flex items-center justify-center border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md py-2 text-xs sm:text-sm"
                          title="Details"
                        >
                          Details
                        </Link>
                        <Link
                          to={`/assessment/${assessment._id}?start=1`}
                          className="flex-1 btn-primary py-2 text-xs sm:text-sm text-center"
                          title="Start"
                        >
                          Start
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {examAssessments.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Exam</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {examAssessments.map((assessment) => (
                  <div key={assessment._id} className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm hover:border-gray-300 transition sm:min-h-[170px] min-h-[140px] flex flex-col">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-sm font-bold text-gray-900 tracking-wide uppercase">
                        <span className="inline-flex w-6 h-6 items-center justify-center rounded-md bg-red-50 text-red-600">
                          <MdSchool className="w-4 h-4" />
                        </span>
                        {(assessment.courseId?.courseCode || assessment.course?.courseCode || 'UNKNOWN COURSE').toUpperCase()}
                      </div>
                      { (assessment.courseId?.title || assessment.course?.title) && (
                        <div className="mt-1 text-[11px] text-gray-500 truncate px-2">{assessment.courseId?.title || assessment.course?.title}</div>
                      )}
                      <div className="mt-2 flex items-center justify-center gap-3 text-[11px] text-gray-600">
                        <span className="inline-flex items-center gap-1">
                          <MdSchedule className="w-3 h-3" /> {formatTimeLimit(assessment.timeLimit)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MdCheckCircle className="w-3 h-3" /> {(assessment.questions?.length || 0)} Qs
                        </span>
                      </div>
                    </div>
                    <div className="mt-auto pt-3">
                      <div className="flex gap-2">
                        <Link
                          to={`/assessment/${assessment._id}`}
                          className="flex-1 inline-flex items-center justify-center border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md py-2 text-xs sm:text-sm"
                          title="Details"
                        >
                          Details
                        </Link>
                        <Link
                          to={`/assessment/${assessment._id}?start=1`}
                          className="flex-1 btn-primary py-2 text-xs sm:text-sm text-center"
                          title="Start"
                        >
                          Start
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      <div className="mt-4 sm:mt-6">
        <Link to="/courses" className="btn-primary w-full sm:w-auto text-center block sm:inline-block">
          Browse All Courses
        </Link>
      </div>
    </Card>
  );
};

export default RecentAssessments;
