import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useAppSettings } from '../useAppSettings';
import axios from '../api/axios';
import { setCurrentUser, setToken, setResetToken } from '../redux/user/user.actions';
import { isEmailVerified, getVerifiedUserRedirectPath } from '../utils/auth';
import { FaArrowLeft, FaCheckCircle, FaEdit, FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';

const ForgotPassword = () => {
  const { theme, t, deviceId } = useAppSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const queryToken = searchParams.get('token') || searchParams.get('q');
  const reduxResetToken = useSelector((state) => state.user.resetToken);

  // Step state: 'email' | 'otp' | 'newPassword'
  const [step, setStep] = useState(queryToken || location.state?.token ? 'newPassword' : 'email');
  const [email, setEmail] = useState(location.state?.email || '');
  const [mailToken, setMailToken] = useState('');
  const [resetPasswordToken, setResetPasswordToken] = useState(queryToken || location.state?.token || reduxResetToken || '');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  // Password fields
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const formatCooldown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const otpInputRefs = useRef([]);

  // Resend cooldown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Step 1: Submit email -> POST /api/v1/auth/send
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      // POST url: /api/v1/auth/send req.body email resp: {"isSuccess":true,"token":""}
      const response = await axios.post(
        '/api/v1/auth/send',
        { email },
        { showLoader: false }
      );

      if (response.data?.isSuccess) {
        const receivedToken = response.data?.token || response.data?.data?.token || '';
        setMailToken(receivedToken);
        setStep('otp');
        setResendCooldown(300); // 5 minutes cooldown
        setSuccessMsg(`A 6-digit verification code has been sent to ${email}`);
        setTimeout(() => {
          if (otpInputRefs.current[0]) {
            otpInputRefs.current[0].focus();
          }
        }, 150);
      } else {
        setError(response.data?.message || 'Failed to send verification code. Please check your email.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to send verification code. Please check your email and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index, value) => {
    const cleaned = value.replace(/\D/g, '');
    const newOtp = [...otp];

    if (cleaned.length > 0) {
      newOtp[index] = cleaned[cleaned.length - 1];
      setOtp(newOtp);

      if (index < 5 && otpInputRefs.current[index + 1]) {
        otpInputRefs.current[index + 1].focus();
      }
    } else {
      newOtp[index] = '';
      setOtp(newOtp);
    }
  };

  // Handle backspace and navigation in OTP
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste in OTP inputs
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || '';
    }
    setOtp(newOtp);

    const focusIndex = Math.min(pastedData.length, 5);
    otpInputRefs.current[focusIndex]?.focus();
  };

  // Step 2: Submit OTP -> POST /api/v1/mail/verify
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    setError('');

    if (otpCode.length < 6) {
      setError('Please enter all 6 digits of the OTP code.');
      return;
    }

    setLoading(true);

    try {
      // POST url: /api/v1/mail/verify req.body: token, otp resp: isSuccess, token
      const response = await axios.post(
        '/api/v1/mail/verify',
        {
          token: mailToken,
          otp: otpCode
        },
        { showLoader: false }
      );

      if (response.data?.isSuccess) {
        const verifiedToken = response.data?.token || response.data?.data?.token || mailToken;
        setResetPasswordToken(verifiedToken);
        dispatch(setResetToken(verifiedToken));
        setStep('newPassword');
        setError('');
        setSuccessMsg('OTP verified successfully! Please enter your new password.');
      } else {
        setError(response.data?.message || 'Invalid or expired OTP code. Please try again.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Invalid or expired OTP code. Please check and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP -> POST /api/v1/auth/send
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        '/api/v1/auth/send',
        { email },
        { showLoader: false }
      );

      if (response.data?.isSuccess) {
        const receivedToken = response.data?.token || response.data?.data?.token || '';
        setMailToken(receivedToken);
        setResendCooldown(300); // 5 minutes cooldown
        setOtp(['', '', '', '', '', '']);
        setSuccessMsg(`New 6-digit OTP has been sent to ${email}`);
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 100);
      } else {
        setError(response.data?.message || 'Failed to resend OTP.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Change Password -> POST /api/v1/forget/reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter a new password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // Check before hitting submit: both should be same
    if (password !== confirmPassword) {
      setError(t.auth.passwordsDoNotMatch || 'Passwords do not match. Please verify and try again.');
      return;
    }

    setLoading(true);

    try {
      const activeToken = resetPasswordToken || reduxResetToken || mailToken || '';

      const payload = {
        password,
        cpassword: confirmPassword,
        device_id: deviceId
      };

      const response = await axios.post(
        '/api/v1/forget/reset',
        payload,
        {
          headers: {
            'Authorization': `Bearer ${activeToken}`,
            'x-device-type': 'web'
          },
          showLoader: false
        }
      );

      if (response.data?.isSuccess) {
        const { user, accessToken } = response.data.data;
        dispatch(setCurrentUser(user));
        dispatch(setToken(accessToken));
        dispatch(setResetToken(null));

        // Same as login redirection
        if (!isEmailVerified(user)) {
          navigate('/verify-email', { state: { email: user?.email || email, fromLogin: true } });
        } else {
          navigate(getVerifiedUserRedirectPath(user));
        }
      } else {
        setError(response.data?.message || 'Failed to reset password.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to reset password. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
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
        {/* Step 1: Enter Email */}
        {step === 'email' && (
          <div>
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-custom-primary uppercase tracking-tighter">
                {t.auth.forgotPassword || 'Forgot Password'}
              </h2>
              <p className={`mt-2 text-sm uppercase tracking-widest ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>
                {t.auth.enterEmail || 'Enter Email'}
              </p>
              <p className={`mt-3 text-sm leading-relaxed ${theme === 'dark' ? 'text-white/70' : 'text-black/70'}`}>
                {t.auth.forgotPasswordInstruction || 'Please enter the email address registered with this app to receive your 6-digit OTP.'}
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleEmailSubmit}>
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-xs py-3 px-4 text-center uppercase tracking-widest font-bold">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="reset-email" className="block text-xs font-bold text-custom-primary uppercase tracking-widest mb-2">
                  {t.auth.enterEmail || 'Enter Email'}
                </label>
                <input
                  id="reset-email"
                  name="email"
                  type="email"
                  required
                  autoFocus
                  className={`appearance-none block w-full px-4 py-3 rounded-lg bg-transparent border focus:outline-none focus:border-custom-primary transition-all text-sm ${
                    theme === 'dark' ? 'border-white/20 text-white placeholder-white/20' : 'border-black/10 text-black placeholder-black/40'
                  }`}
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-4 px-4 rounded-lg border border-transparent text-sm font-bold uppercase tracking-widest text-black bg-custom-primary hover:bg-black hover:text-custom-primary transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Processing...' : (t.auth.submit || 'Submit')}
                </motion.button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-custom-primary hover:underline transition-all"
              >
                <FaArrowLeft size={12} /> {t.auth.backToLogin || 'Back to Login'}
              </Link>
            </div>
          </div>
        )}

        {/* Step 2: Verify OTP */}
        {step === 'otp' && (
          <div>
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-custom-primary uppercase tracking-tighter">
                {t.auth.verifyOtp || 'Verify OTP'}
              </h2>
              <p className={`mt-2 text-sm uppercase tracking-widest ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>
                6-Digit Verification Code
              </p>
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-custom-primary font-medium">
                <span>Sent to: {email}</span>
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="inline-flex items-center gap-1 text-[11px] underline opacity-80 hover:opacity-100 cursor-pointer"
                >
                  <FaEdit size={10} /> Edit
                </button>
              </div>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleOtpSubmit}>
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-xs py-3 px-4 text-center uppercase tracking-widest font-bold">
                  {error}
                </div>
              )}

              {successMsg && !error && (
                <div className="bg-green-500/10 border border-green-500/50 rounded-lg text-green-500 text-xs py-3 px-4 text-center tracking-wider font-semibold">
                  {successMsg}
                </div>
              )}

              {/* 6-Digit OTP Inputs */}
              <div>
                <label className="block text-xs font-bold text-custom-primary uppercase tracking-widest mb-3 text-center">
                  Enter 6-Digit OTP
                </label>
                <div className="flex justify-center items-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className={`w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-md bg-transparent border transition-all focus:outline-none focus:border-custom-primary ${
                        digit
                          ? 'border-custom-primary text-custom-primary'
                          : theme === 'dark'
                          ? 'border-white/20 text-white'
                          : 'border-black/20 text-black'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* OTP Submit Button */}
              <div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || otp.join('').length < 6}
                  className="group relative w-full flex justify-center py-4 px-4 rounded-lg border border-transparent text-sm font-bold uppercase tracking-widest text-black bg-custom-primary hover:bg-black hover:text-custom-primary transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : (t.auth.otpSubmitBtn || 'Verify OTP')}
                </motion.button>
              </div>

              {/* Resend OTP Button */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading || resendCooldown > 0}
                  className={`text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    theme === 'dark' ? 'text-white/70 hover:text-custom-primary' : 'text-black/70 hover:text-custom-primary'
                  }`}
                >
                  {resendCooldown > 0 ? `Resend OTP in ${formatCooldown(resendCooldown)}` : (t.auth.resendOtp || 'Resend OTP')}
                </button>

                <Link
                  to="/login"
                  className="text-xs font-bold uppercase tracking-wider text-custom-primary hover:underline transition-all"
                >
                  {t.auth.backToLogin || 'Back to Login'}
                </Link>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Actual Change Password Page */}
        {step === 'newPassword' && (
          <div>
            <div className="text-center">
              <div className="flex justify-center mb-3 text-custom-primary">
                <FaLock size={40} />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-custom-primary uppercase tracking-tighter">
                {t.auth.resetPassword || 'Reset Password'}
              </h2>
              <p className={`mt-2 text-sm uppercase tracking-widest ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>
                {t.auth.createNewPassword || 'Create New Password'}
              </p>
              <p className={`mt-3 text-xs leading-relaxed ${theme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>
                Please enter and confirm your new password. Both fields must match.
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-xs py-3 px-4 text-center uppercase tracking-widest font-bold">
                  {error}
                </div>
              )}

              {successMsg && !error && (
                <div className="bg-green-500/10 border border-green-500/50 rounded-lg text-green-500 text-xs py-3 px-4 text-center tracking-wider font-semibold">
                  {successMsg}
                </div>
              )}

              <div className="space-y-4">
                {/* New Password */}
                <div className="relative">
                  <label htmlFor="new-password" className="block text-xs font-bold text-custom-primary uppercase tracking-widest mb-2">
                    {t.auth.newPassword || 'New Password'}
                  </label>
                  <input
                    id="new-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`appearance-none block w-full px-4 py-3 rounded-lg bg-transparent border focus:outline-none focus:border-custom-primary transition-all text-sm ${
                      theme === 'dark' ? 'border-white/20 text-white placeholder-white/20' : 'border-black/10 text-black placeholder-black/40'
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute right-4 bottom-3 text-custom-primary cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <label htmlFor="confirm-password" className="block text-xs font-bold text-custom-primary uppercase tracking-widest mb-2">
                    {t.auth.confirmPassword || 'Confirm Password'}
                  </label>
                  <input
                    id="confirm-password"
                    name="cpassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`appearance-none block w-full px-4 py-3 rounded-lg bg-transparent border focus:outline-none focus:border-custom-primary transition-all text-sm ${
                      theme === 'dark' ? 'border-white/20 text-white placeholder-white/20' : 'border-black/10 text-black placeholder-black/40'
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute right-4 bottom-3 text-custom-primary cursor-pointer"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-4 px-4 rounded-lg border border-transparent text-sm font-bold uppercase tracking-widest text-black bg-custom-primary hover:bg-black hover:text-custom-primary transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Processing...' : (t.auth.submit || 'Submit')}
                </motion.button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-custom-primary hover:underline transition-all"
              >
                <FaArrowLeft size={12} /> {t.auth.backToLogin || 'Back to Login'}
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
