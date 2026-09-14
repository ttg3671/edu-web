import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

import { isEmailVerified } from '../utils/auth';

const ProtectedRoute = ({ children }) => {
  const currentUser = useSelector((state) => state.user.currentUser);
  const location = useLocation();

  if (!currentUser) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected, preserving any plan query parameter.
    const searchParams = new URLSearchParams(location.search);
    const plan = searchParams.get('plan');
    const redirectUrl = plan ? `/login?plan=${encodeURIComponent(plan)}` : '/login';
    return <Navigate to={redirectUrl} state={{ from: location, plan }} replace />;
  }

  if (!isEmailVerified(currentUser)) {
    const searchParams = new URLSearchParams(location.search);
    const plan = searchParams.get('plan');
    return <Navigate to="/verify-email" state={{ email: currentUser.email, fromLogin: true, plan }} replace />;
  }

  return children;
};

export default ProtectedRoute;
