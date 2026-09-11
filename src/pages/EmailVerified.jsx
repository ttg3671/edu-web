import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useAppSettings } from '../useAppSettings';
import { setCurrentUser } from '../redux/user/user.actions';
import { isEmailVerified, getVerifiedUserRedirectPath } from '../utils/auth';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaExclamationTriangle, 
  FaSpinner, 
  FaArrowRight, 
  FaRedo,
  FaSignInAlt,
  FaMobileAlt
} from 'react-icons/fa';

const parseStatusType = (status) => {
  if (!status) return 'success';
  const s = status.toLowerCase().trim().replace(/[-_]/g, '');

  if (s.includes('already')) return 'already_verified';
  if (s.includes('expire')) return 'expired';
  if (s.includes('load') || s.includes('pend') || s === 'verifying') return 'loading';
  if (s.includes('fail') || s.includes('err') || s.includes('invalid') || s.includes('unauth') || s === '0' || s === 'false') {
    return 'error';
  }
  if (s.includes('success') || s.includes('verif') || s === 'ok' || s === '1' || s === 'true') {
    return 'success';
  }
  return 'error';
};

const EmailVerified = () => {
  const { theme, t } = useAppSettings();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.currentUser);

  const { status: routeStatus } = useParams();
  const [searchParams] = useSearchParams();

  // Extract status and any custom message from URL params or query strings
  const rawStatus = routeStatus || searchParams.get('status') || searchParams.get('state') || '';
  const customMessage = searchParams.get('message') || searchParams.get('msg') || searchParams.get('error');

  const statusType = useMemo(() => parseStatusType(rawStatus), [rawStatus]);

  // If status is successful, update currentUser.email_verified in Redux store
  useEffect(() => {
    if ((statusType === 'success' || statusType === 'already_verified') && currentUser) {
      if (!isEmailVerified(currentUser)) {
        dispatch(setCurrentUser({
          ...currentUser,
          email_verified: true,
          is_verified: 1
        }));
      }
    }
  }, [statusType, currentUser, dispatch]);

  const handleOpenInApp = () => {
    window.location.href = "edugarciamovimiento://callback?screen=email_verified";
  };

  const handleRedirectNow = () => {
    navigate(getVerifiedUserRedirectPath(currentUser));
  };

  // Status configuration object for dynamic UI rendering
  const config = useMemo(() => {
    switch (statusType) {
      case 'already_verified':
        return {
          title: t?.auth?.emailVerifiedAlreadyTitle || 'Email Already Verified',
          subtitle: t?.auth?.emailVerifiedAlreadySubtitle || 'Your email address is already verified.',
          description: customMessage || t?.auth?.emailVerifiedAlreadyDesc || 'Your account is already active. You can proceed to explore our workouts and membership options.',
          icon: <FaCheckCircle className="text-custom-primary text-7xl sm:text-8xl drop-shadow-[0_0_20px_rgba(245,197,66,0.35)]" />,
          glowClass: 'bg-custom-primary/20',
          badgeText: 'ALREADY VERIFIED',
          badgeClass: 'bg-custom-primary/10 text-custom-primary border-custom-primary/30',
          borderColor: theme === 'dark' ? 'border-custom-primary/30' : 'border-custom-primary/40',
        };

      case 'expired':
        return {
          title: t?.auth?.emailVerifiedExpiredTitle || 'Verification Link Expired',
          subtitle: t?.auth?.emailVerifiedExpiredSubtitle || 'This verification link has expired.',
          description: customMessage || t?.auth?.emailVerifiedExpiredDesc || 'For your security, verification links expire after a limited period. Please request a new verification link.',
          icon: <FaExclamationTriangle className="text-amber-400 text-7xl sm:text-8xl drop-shadow-[0_0_20px_rgba(251,191,36,0.35)]" />,
          glowClass: 'bg-amber-500/20',
          badgeText: 'LINK EXPIRED',
          badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          borderColor: 'border-amber-500/40',
        };

      case 'error':
        return {
          title: t?.auth?.emailVerifiedFailedTitle || 'Verification Failed',
          subtitle: t?.auth?.emailVerifiedFailedSubtitle || 'We could not verify your email address.',
          description: customMessage || t?.auth?.emailVerifiedFailedDesc || 'The verification link may be invalid, broken, or has already been used. Please request a new verification link.',
          icon: <FaTimesCircle className="text-red-500 text-7xl sm:text-8xl drop-shadow-[0_0_20px_rgba(239,68,68,0.35)]" />,
          glowClass: 'bg-red-500/20',
          badgeText: 'VERIFICATION FAILED',
          badgeClass: 'bg-red-500/10 text-red-400 border-red-500/30',
          borderColor: 'border-red-500/40',
        };

      case 'loading':
        return {
          title: t?.auth?.emailVerifiedLoadingTitle || 'Verifying Email...',
          subtitle: t?.auth?.emailVerifiedLoadingSubtitle || 'Please wait while we verify your email address.',
          description: customMessage || 'Validating verification details.',
          icon: (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            >
              <FaSpinner className="text-custom-primary text-7xl sm:text-8xl drop-shadow-[0_0_20px_rgba(245,197,66,0.35)]" />
            </motion.div>
          ),
          glowClass: 'bg-custom-primary/20',
          badgeText: 'VERIFYING',
          badgeClass: 'bg-custom-primary/10 text-custom-primary border-custom-primary/30',
          borderColor: theme === 'dark' ? 'border-custom-primary/30' : 'border-custom-primary/40',
        };

      case 'success':
      default:
        return {
          title: t?.auth?.emailVerifiedTitle || 'Email Verification Successful',
          subtitle: t?.auth?.emailVerifiedSubtitle || 'Your email address has been verified successfully.',
          description: customMessage || t?.auth?.emailVerifiedDesc || 'Thank you for confirming your email. You can now open the app or explore our workouts and membership plans.',
          icon: <FaCheckCircle className="text-custom-primary text-7xl sm:text-8xl drop-shadow-[0_0_20px_rgba(245,197,66,0.35)]" />,
          glowClass: 'bg-custom-primary/20',
          badgeText: 'VERIFIED',
          badgeClass: 'bg-green-500/10 text-green-400 border-green-500/30',
          borderColor: theme === 'dark' ? 'border-white/20' : 'border-black/10',
        };
    }
  }, [statusType, customMessage, theme, t]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-custom-bg px-6 pt-32 sm:pt-36 pb-16">
      <motion.div
        key={statusType}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={`max-w-md w-full my-auto text-center space-y-7 p-8 sm:p-10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.15)] border ${
          config.borderColor
        } ${
          theme === 'dark' ? 'bg-black/40' : 'bg-white/70'
        } backdrop-blur-md`}
      >
        {/* Status Badge */}
        <div className="flex justify-center">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-widest uppercase border ${config.badgeClass}`}>
            {config.badgeText}
          </span>
        </div>

        {/* Animated Icon */}
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 220,
              damping: 15,
              delay: 0.1
            }}
            className="relative"
          >
            <div className={`absolute inset-0 rounded-full blur-xl animate-pulse ${config.glowClass}`} />
            <div className="relative">{config.icon}</div>
          </motion.div>
        </div>

        {/* Title & Descriptions */}
        <div className="space-y-3">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-3xl sm:text-4xl font-bold uppercase tracking-tighter ${
              statusType === 'error'
                ? 'text-red-500'
                : statusType === 'expired'
                ? 'text-amber-400'
                : 'text-custom-primary'
            }`}
          >
            {config.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className={`text-sm sm:text-base font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-white/80' : 'text-black/80'
            }`}
          >
            {config.subtitle}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`text-xs sm:text-sm leading-relaxed ${
              theme === 'dark' ? 'text-white/60' : 'text-black/60'
            }`}
          >
            {config.description}
          </motion.p>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3 pt-2"
        >
          {statusType === 'success' || statusType === 'already_verified' ? (
            <>
              {/* Primary action: Open in App */}
              <a
                href="edugarciamovimiento://callback?screen=email_verified"
                onClick={handleOpenInApp}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-lg font-bold uppercase tracking-widest text-black bg-custom-primary hover:bg-white hover:text-black transition-all cursor-pointer shadow-lg"
              >
                <FaMobileAlt className="text-base" />
                <span>{t?.auth?.openInApp || 'Open in App'}</span>
              </a>

              {/* Secondary action: Go to Pricing */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRedirectNow}
                className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-lg font-semibold uppercase tracking-wider border transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'border-white/20 text-white hover:bg-white/10'
                    : 'border-black/10 text-black hover:bg-black/5'
                }`}
              >
                <span>{t?.auth?.emailVerifiedRedirectBtn || 'Go to Pricing Now'}</span>
                <FaArrowRight className="text-xs" />
              </motion.button>

              <Link
                to="/"
                className={`block text-xs font-semibold uppercase tracking-wider py-2 transition-colors ${
                  theme === 'dark'
                    ? 'text-white/60 hover:text-custom-primary'
                    : 'text-black/60 hover:text-custom-primary'
                }`}
              >
                {t?.auth?.emailVerifiedBackHome || 'Back to Home'}
              </Link>
            </>
          ) : statusType === 'loading' ? (
            <Link
              to="/"
              className={`block text-xs font-semibold uppercase tracking-wider py-2 transition-colors ${
                theme === 'dark'
                  ? 'text-white/60 hover:text-custom-primary'
                  : 'text-black/60 hover:text-custom-primary'
              }`}
            >
              {t?.auth?.emailVerifiedBackHome || 'Back to Home'}
            </Link>
          ) : (
            <>
              {/* Primary action for error / expired: Resend or Request New Link */}
              <Link
                to="/verify-email"
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-lg font-bold uppercase tracking-widest text-black bg-custom-primary hover:bg-white hover:text-black transition-all shadow-lg"
              >
                <FaRedo className="text-xs" />
                <span>{t?.auth?.emailVerifiedResendBtn || 'Request New Verification Link'}</span>
              </Link>

              {/* Secondary action: Go to Login */}
              <Link
                to="/login"
                className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold uppercase tracking-wider border transition-all ${
                  theme === 'dark'
                    ? 'border-white/20 text-white hover:bg-white/10'
                    : 'border-black/10 text-black hover:bg-black/5'
                }`}
              >
                <FaSignInAlt className="text-xs" />
                <span>{t?.auth?.backToLogin || 'Back to Login'}</span>
              </Link>

              <div className="flex items-center justify-between text-xs pt-1 px-1">
                <Link
                  to="/pricing"
                  className="font-semibold uppercase tracking-wider text-custom-primary hover:underline"
                >
                  {t?.navbar?.pricing || 'Pricing'}
                </Link>
                <Link
                  to="/"
                  className={`font-semibold uppercase tracking-wider transition-colors ${
                    theme === 'dark' ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'
                  }`}
                >
                  {t?.auth?.emailVerifiedBackHome || 'Back to Home'}
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EmailVerified;
