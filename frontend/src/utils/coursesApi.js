import axios from 'axios';

export const getCourseWithProgress = async (courseId) => {
  const res = await axios.get(`/api/courses/${courseId}`);
  return res.data.course || res.data;
};

export const getCourseProgress = async (courseId) => {
  const res = await axios.get(`/api/courses/progress/${courseId}`);
  return res.data.progress;
};

export const completeModule = async (courseId, moduleId) => {
  const res = await axios.post(`/api/courses/${courseId}/module/${moduleId}/complete`);
  return res.data;
};


