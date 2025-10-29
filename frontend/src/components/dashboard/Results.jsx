import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const gradeFromTotal = (total) => {
  if (typeof total !== 'number') return null;
  if (total >= 70) return 'A';
  if (total >= 60) return 'B';
  if (total >= 50) return 'C';
  if (total >= 40) return 'D';
  if (total >= 30) return 'E';
  return 'F';
};

const Results = () => {
  const [results, setResults] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [resResults, resCourses] = await Promise.all([
        axios.get('/api/assessments/results'),
        axios.get('/api/courses/personalized')
      ]);
      setResults(resResults.data.results || []);
      setCourses(resCourses.data.courses || []);
    } catch (error) {
      console.error('Failed to load results:', error);
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const rows = useMemo(() => {
    // Build a lookup of results by courseId and type
    const byCourse = new Map();
    for (const r of results) {
      const key = (r.courseId?._id || r.courseId || '').toString();
      if (!key) continue;
      const entry = byCourse.get(key) || { ca: null, exam: null };
      // Store raw earned marks and total marks (counts)
      if (r.type === 'ca' && entry.ca == null) entry.ca = { earned: r.earnedMarks, total: r.totalMarks, attemptedAt: r.attemptedAt };
      if (r.type === 'exam' && entry.exam == null) entry.exam = { earned: r.earnedMarks, total: r.totalMarks, attemptedAt: r.attemptedAt };
      byCourse.set(key, entry);
    }

    // Start from all available courses for the user
    const courseRows = (courses || []).map((c) => {
      const key = (c._id || '').toString();
      const resEntry = byCourse.get(key) || { ca: null, exam: null };
      const caEarned = typeof resEntry.ca?.earned === 'number' ? resEntry.ca.earned : null;
      const caTotal = typeof resEntry.ca?.total === 'number' ? resEntry.ca.total : null;
      const examEarned = typeof resEntry.exam?.earned === 'number' ? resEntry.exam.earned : null;
      const examTotal = typeof resEntry.exam?.total === 'number' ? resEntry.exam.total : null;
      const hasAny = caEarned !== null || examEarned !== null;
      const totalEarned = (caEarned || 0) + (examEarned || 0);
      const totalPossible = (caTotal || 0) + (examTotal || 0);
      return {
        courseId: key,
        courseCode: c.courseCode || 'UNKNOWN',
        courseTitle: c.title || '',
        ca: resEntry.ca,
        exam: resEntry.exam,
        totalEarned,
        totalPossible,
        grade: hasAny ? gradeFromTotal(totalEarned) : null
      };
    });

    // Include any result entries for courses that are no longer in personalized list
    for (const [key, resEntry] of byCourse.entries()) {
      const exists = courseRows.some((row) => row.courseId === key);
      if (!exists) {
        const caEarned = typeof resEntry.ca?.earned === 'number' ? resEntry.ca.earned : null;
        const caTotal = typeof resEntry.ca?.total === 'number' ? resEntry.ca.total : null;
        const examEarned = typeof resEntry.exam?.earned === 'number' ? resEntry.exam.earned : null;
        const examTotal = typeof resEntry.exam?.total === 'number' ? resEntry.exam.total : null;
        const hasAny = caEarned !== null || examEarned !== null;
        const totalEarned = (caEarned || 0) + (examEarned || 0);
        const totalPossible = (caTotal || 0) + (examTotal || 0);
        courseRows.push({
          courseId: key,
          courseCode: 'UNKNOWN',
          courseTitle: '',
          ca: resEntry.ca,
          exam: resEntry.exam,
          totalEarned,
          totalPossible,
          grade: hasAny ? gradeFromTotal(totalEarned) : null
        });
      }
    }

    // Sort by course code for stable display
    courseRows.sort((a, b) => (a.courseCode || '').localeCompare(b.courseCode || ''));
    return courseRows;
  }, [results, courses]);

  if (loading) {
    return (
      <div className="card">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Results</h2>
        <div className="space-y-2">
          {[1,2,3].map(i => (
            <div key={i} className="h-10 bg-gray-200 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Results</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-gray-600">Course</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-600">CA</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-600">Exam</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-600">Total</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-600">Grade</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">No assessment results yet.</td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.courseId} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-900 font-medium">
                    {(row.courseCode || 'UNKNOWN').toUpperCase()}
                    <div className="text-xs text-gray-500">{row.courseTitle}</div>
                  </td>
                  <td className="px-4 py-2">
                    {typeof row.ca?.earned === 'number' && typeof row.ca?.total === 'number'
                      ? `${row.ca.earned}`
                      : '-'}
                  </td>
                  <td className="px-4 py-2">
                    {typeof row.exam?.earned === 'number' && typeof row.exam?.total === 'number'
                      ? `${row.exam.earned}`
                      : '-'}
                  </td>
                  <td className="px-4 py-2 font-semibold">
                    {typeof row.totalEarned === 'number' ? `${row.totalEarned}` : '-'}
                  </td>
                  <td className="px-4 py-2">
                    {row.grade ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-800">
                        {row.grade}
                      </span>
                    ) : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Results;


