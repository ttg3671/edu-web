import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAppSettings } from '../useAppSettings';
import axios from '../api/axios';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentUser, setToken } from '../redux/user/user.actions';
import { getDeviceId } from '../utils/deviceId';
import { isEmailVerified, getVerifiedUserRedirectPath } from '../utils/auth';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const SignIn = () => {
  const { theme, t } = useAppSettings();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const planParam = location.state?.plan || searchParams.get('plan');
  const currentUser = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    if (currentUser) {
      if (!isEmailVerified(currentUser)) {
        navigate('/verify-email', { state: { email: currentUser.email, fromLogin: true, plan: planParam }, replace: true });
      } else {
        const dest = getVerifiedUserRedirectPath(currentUser);
        if (dest === '/pricing' && planParam) {
          navigate(`/pricing?plan=${encodeURIComponent(planParam)}`, { replace: true });
        } else {
          navigate(dest, { replace: true });
        }
      }
    }
  }, [currentUser, navigate, planParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const deviceId = getDeviceId();

    try {
      const response = await axios.post('/api/v1/auth/sign-in', {
        email,
        password,
        device_id: deviceId
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
          navigate('/verify-email', { state: { email: user?.email || email, fromLogin: true, plan: planParam } });
        } else {
          const dest = getVerifiedUserRedirectPath(user);
          if (dest === '/pricing' && planParam) {
            navigate(`/pricing?plan=${encodeURIComponent(planParam)}`);
          } else {
            navigate(dest);
          }
        }
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-custom-bg px-6 pt-32 sm:pt-36 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`max-w-md w-full my-auto space-y-8 p-8 sm:p-10 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.1)] border border-dotted ${theme === 'dark' ? 'border-white/20' : 'border-black/10'}`}
      >
        <div className="text-center">
          <h2 className="text-4xl font-bold text-custom-primary uppercase tracking-tighter">{t.auth.signIn}</h2>
          <p className={`mt-2 text-sm uppercase tracking-widest ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>{t.auth.welcome}</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-xs py-3 px-4 text-center uppercase tracking-widest font-bold">
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
                  className={`appearance-none block w-full px-4 py-3 rounded-lg bg-transparent border focus:outline-none focus:border-custom-primary transition-all text-sm ${theme === 'dark' ? 'border-white/20 text-white placeholder-white/20' : 'border-black/10 text-black placeholder-black/40'}`}
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
                  className={`appearance-none block w-full px-4 py-3 rounded-lg bg-transparent border focus:outline-none focus:border-custom-primary transition-all text-sm ${theme === 'dark' ? 'border-white/20 text-white placeholder-white/20' : 'border-black/10 text-black placeholder-black/40'}`}
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

              <div className="flex justify-end pt-1">
                <Link
                  to="/forgot-password"
                  className="text-xs uppercase tracking-wider font-semibold text-custom-primary hover:underline transition-all"
                >
                  {t.auth.forgotPassword || 'Forgot Password?'}
                </Link>
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
          </fieldset>
        </form>

      </motion.div>
    </div>
  );
};

export default SignIn;
