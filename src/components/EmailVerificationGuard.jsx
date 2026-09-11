import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { isEmailVerified, getVerifiedUserRedirectPath } from '../utils/auth';

/**
 * Route guard that prevents verified users (where email_verified is true)
 * from accessing email verification pages (/verify-email, /email-verified).
 * If the user's email is verified, redirects them to their appropriate dashboard/page.
 */
const EmailVerificationGuard = ({ children }) => {
  const currentUser = useSelector((state) => state.user.currentUser);

  if (isEmailVerified(currentUser)) {
    return <Navigate to={getVerifiedUserRedirectPath(currentUser)} replace />;
  }

  return children;
};

export default EmailVerificationGuard;
