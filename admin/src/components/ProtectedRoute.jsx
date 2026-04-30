import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  const adminInfo = localStorage.getItem('adminInfo');

  if (!token || !adminInfo) {
    return <Navigate to="/login" replace />;
  }

  // Double check admin role inside localStorage payload just to be safe on frontend side
  try {
    const parsed = JSON.parse(adminInfo);
    if (parsed.role !== 'admin') {
      return <Navigate to="/login" replace />;
    }
  } catch (e) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
