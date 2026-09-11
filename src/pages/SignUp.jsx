import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSettings } from '../useAppSettings';
import axios from '../api/axios';
import { useDispatch } from 'react-redux';
import { setCurrentUser, setToken } from '../redux/user/user.actions';
import { getDeviceId } from '../utils/deviceId';
import { isEmailVerified, getVerifiedUserRedirectPath } from '../utils/auth';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const SignUp = () => {
  const { theme, t } = useAppSettings();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);

    const deviceId = getDeviceId();

    try {
      const response = await axios.post('/api/v1/auth/sign-up', {
        email,
        password,
        cpassword: confirmPassword,
        device_id: deviceId,
        device_type: 'web'
      }, {
        headers: {
          'x-device-type': 'web'
        },
        showLoader: false
      });

      if (response.data.isSuccess) {
        const { user, accessToken } = response.data.data;
        dispatch(setCurrentUser(user));
        dispatch(setToken(accessToken));

        if (!isEmailVerified(user)) {
          navigate('/verify-email', { state: { email: user?.email || email, fromLogin: true } });
        } else {
          navigate(getVerifiedUserRedirectPath(user));
        }
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Account already exists. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-custom-bg px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`max-w-md w-full space-y-8 p-10 shadow-[0_0_50px_rgba(0,0,0,0.1)] border border-dotted ${theme === 'dark' ? 'border-white/20' : 'border-black/10'}`}
      >
        <div className="text-center">
          <h2 className="text-4xl font-bold text-custom-primary uppercase tracking-tighter">{t.auth.signUp}</h2>
          <p className={`mt-2 text-sm uppercase tracking-widest ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>{t.auth.join}</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs py-3 px-4 text-center uppercase tracking-widest font-bold">
              {error}
            </div>
          )}
          <fieldset disabled={loading} className="space-y-4 contents">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-custom-primary uppercase tracking-widest mb-2">{t.auth.email}</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className={`appearance-none block w-full px-4 py-3 bg-transparent border focus:outline-none focus:border-custom-primary transition-all text-sm ${theme === 'dark' ? 'border-white/20 text-white placeholder-white/20' : 'border-black/10 text-black placeholder-black/40'}`}
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="relative">
                <label htmlFor="password" className="block text-xs font-bold text-custom-primary uppercase tracking-widest mb-2">{t.auth.password}</label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className={`appearance-none block w-full px-4 py-3 bg-transparent border focus:outline-none focus:border-custom-primary transition-all text-sm ${theme === 'dark' ? 'border-white/20 text-white placeholder-white/20' : 'border-black/10 text-black placeholder-black/40'}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-4 bottom-3 text-custom-primary cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
              <div className="relative">
                <label htmlFor="confirm-password" className="block text-xs font-bold text-custom-primary uppercase tracking-widest mb-2">{t.auth.confirmPassword}</label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className={`appearance-none block w-full px-4 py-3 bg-transparent border focus:outline-none focus:border-custom-primary transition-all text-sm ${theme === 'dark' ? 'border-white/20 text-white placeholder-white/20' : 'border-black/10 text-black placeholder-black/40'}`}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold uppercase tracking-widest text-black bg-custom-primary hover:bg-black hover:text-custom-primary transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Processing...' : t.auth.registerBtn}
              </motion.button>
            </div>
          </fieldset>
        </form>

        <div className="text-center">
          <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>
            {t.auth.haveAccount}{' '}
            <Link to="/login" className="text-custom-primary hover:text-white transition-colors font-bold uppercase tracking-tighter">
              {t.auth.signIn}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;
