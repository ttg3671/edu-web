import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useAppSettings } from '../useAppSettings';
import axios from '../api/axios';
import { logoutUser } from '../redux/user/user.actions';
import { FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import { isEmailVerified, getVerifiedUserRedirectPath } from '../utils/auth';

const VerifyEmail = () => {
  const { theme, t } = useAppSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // If any token query ?q= is passed to /verify-email, forward to /verify?q=

  const currentUser = useSelector((state) => state.user.currentUser);

  // If email is already verified, do not allow going to or staying on /verify-email
  useEffect(() => {
    if (isEmailVerified(currentUser)) {
      navigate(getVerifiedUserRedirectPath(currentUser), { replace: true });
    }
  }, [currentUser, navigate]);

  if (isEmailVerified(currentUser)) {
    return null;
  }

  const [email, setEmail] = useState(location.state?.email || currentUser?.email || '');
  const [loading, setLoading] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sendSuccessMessage, setSendSuccessMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const formatCooldown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Send verification email cooldown timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Handle Send Verification Email
  const handleSendVerification = async (e) => {
    e?.preventDefault();
    if (!email) {
      setSendError('Email address is missing. Please enter your email.');
      return;
    }

    setLoading(true);
    setSendError('');
    setSendSuccessMessage('');

    try {
      // POST /api/v1/auth/send-verification-email req.body: email resp isSuccess, data: {message: ""}
      const response = await axios.post(
        '/api/v1/auth/send-verification-email',
        { email },
        {
          headers: {
            'x-device-type': 'web'
          },
          showLoader: false
        }
      );

      if (response.data?.isSuccess) {
        const msg =
          response.data?.data?.message ||
          response.data?.message ||
          'Verification email sent successfully! Please check your inbox.';
        setSendSuccessMessage(msg);
        setCooldown(300); // 5 minutes cooldown
      } else {
        setSendError(response.data?.message || 'Failed to send verification email. Please try again.');
      }
    } catch (err) {
      setSendError(
        err.response?.data?.message ||
        err.response?.data?.data?.message ||
        'Failed to send verification email. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-custom-bg px-6 pt-32 sm:pt-36 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`max-w-md w-full my-auto space-y-8 p-8 sm:p-10 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.1)] border border-dotted ${
          theme === 'dark' ? 'border-white/20' : 'border-black/10'
        }`}
      >
        <div className="text-center">
          <div className="flex justify-center mb-4 text-custom-primary">
            {sendSuccessMessage ? <FaCheckCircle size={48} /> : <FaEnvelope size={48} />}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-custom-primary uppercase tracking-tighter">
            {t.auth.verifyEmail || 'Verify Email'}
          </h2>
          <p className={`mt-2 text-sm uppercase tracking-widest ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>
            {t.auth.verifyEmailSubtitle || 'Your email address is not verified yet.'}
          </p>
          <p className={`mt-3 text-xs leading-relaxed ${theme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>
            {t.auth.verifyEmailInstructions || 'Click the button below to receive a verification email.'}
          </p>
        </div>

        {sendError && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-xs py-3 px-4 text-center uppercase tracking-widest font-bold">
            {sendError}
          </div>
        )}

        {sendSuccessMessage && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg text-green-500 text-xs py-3 px-4 text-center tracking-wider font-semibold">
            {sendSuccessMessage}
          </div>
        )}

        <form onSubmit={handleSendVerification} className="space-y-6">
          <div>
            <label htmlFor="verify-email-input" className="block text-xs font-bold text-custom-primary uppercase tracking-widest mb-2">
              {t.auth.email || 'Email'}
            </label>
            <input
              id="verify-email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className={`appearance-none block w-full px-4 py-3 rounded-lg bg-transparent border focus:outline-none focus:border-custom-primary transition-all text-sm ${
                theme === 'dark' ? 'border-white/20 text-white placeholder-white/20' : 'border-black/10 text-black placeholder-black/40'
              }`}
            />
          </div>

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || cooldown > 0}
              className="group relative w-full flex justify-center py-4 px-4 rounded-lg border border-transparent text-sm font-bold uppercase tracking-widest text-black bg-custom-primary hover:bg-black hover:text-custom-primary transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Sending...'
                : cooldown > 0
                ? `Resend in ${formatCooldown(cooldown)}`
                : (t.auth.sendVerificationBtn || 'Verify Email')}
            </motion.button>

            <div className="flex items-center justify-between text-xs pt-2">
              <Link
                to="/login"
                className="font-bold uppercase tracking-wider text-custom-primary hover:underline transition-all"
              >
                {t.auth.backToLogin || 'Back to Login'}
              </Link>

              {currentUser && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                    theme === 'dark' ? 'text-white/60 hover:text-custom-primary' : 'text-black/60 hover:text-custom-primary'
                  }`}
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
