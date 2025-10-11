import React from 'react';
import { Navigate } from 'react-router-dom';

const Courses = () => {
  return <Navigate to="/dashboard?tab=courses" replace />;
};

export default Courses;
