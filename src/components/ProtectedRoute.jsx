import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

import { isEmailVerified } from '../utils/auth';

const ProtectedRoute = ({ children }) => {
  const currentUser = useSelector((state) => state.user.currentUser);
  const location = useLocation();

  if (!currentUser) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isEmailVerified(currentUser)) {
    return <Navigate to="/verify-email" state={{ email: currentUser.email, fromLogin: true }} replace />;
  }

  return children;
};

export default ProtectedRoute;
