/**
 * Utility functions for authentication and user verification checks.
 */

/**
 * Checks whether a user's email is verified.
 * Handles boolean, string, and numeric representations (true, 'true', 1, '1').
 * Returns false if email_verified is explicitly false, 0, 'false', '0', null, or undefined.
 *
 * @param {Object|null|undefined} user - The user object (e.g. currentUser)
 * @returns {boolean}
 */
export const isEmailVerified = (user) => {
  if (!user) return false;

  // Explicit falsy representations of verification
  if (
    user.email_verified === false ||
    user.email_verified === 0 ||
    user.email_verified === 'false' ||
    user.email_verified === '0'
  ) {
    return false;
  }

  // Truthy representations
  return (
    user.email_verified === true ||
    user.email_verified === 1 ||
    user.email_verified === 'true' ||
    user.email_verified === '1' ||
    user.is_verified === 1 ||
    user.is_verified === true ||
    user.is_verified === '1' ||
    user.is_verified === 'true'
  );
};

/**
 * Returns the destination path for a verified user based on their role and subscription status.
 *
 * @param {Object|null|undefined} user - The user object (e.g. currentUser)
 * @returns {string} The path to redirect to
 */
export const getVerifiedUserRedirectPath = (user) => {
  if (!user) return '/login';
  if (user.is_reviewer == 1) {
    return '/reviewer-welcome';
  }
  if (user.is_subscribed == 1 && user.is_reviewer == 0) {
    return '/profile';
  }
  return '/pricing';
};
