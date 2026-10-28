import React, { useEffect, useState } from 'react';
import Hero from '../UI/Hero';
import Features from '../UI/Features';
import { About, HomeTestimonials, HomeFaq, FinalCta } from '../UI/HomeSections';
import { useAppSettings } from '../useAppSettings';
import { motion } from 'framer-motion';
import axios from '../api/axios';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentUser, setToken, setDevice } from '../redux/user/user.actions';
import { isEmailVerified, getVerifiedUserRedirectPath } from '../utils/auth';

const Home = () => {
  const { t } = useAppSettings();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const [searchParams] = useSearchParams();
  const nftoken = searchParams.get('nftoken');
  const planParam = searchParams.get('plan');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.currentUser);

  // If there is a plan query param, show selected plan and auto-redirect in pricing page, not in home page
  useEffect(() => {
    // If no nftoken and planParam is present, redirect directly to pricing page
    if (!nftoken) {
      if (planParam) {
        navigate(`/pricing?plan=${encodeURIComponent(planParam)}`, { replace: true });
      }
      return;
    }

    // If nftoken is present, handle login first
    let isMounted = true;
    setIsRedirecting(true);

    const handleAppLogin = async () => {
      try {
        const response = await axios.post('/api/v1/payments/index', {
          token: nftoken
        }, { showLoader: false });

        if (!isMounted) return;

        if (response.data.isSuccess) {
          const { user, accessToken: token, device_id, device: dev } = response.data.data;

          if (device_id) {
            localStorage.setItem('device_id', device_id);
          }

          if (dev) {
            dispatch(setDevice(dev));
          }

          // Store user object and accessToken in Redux
          dispatch(setCurrentUser(user));
          dispatch(setToken(token));

          if (!isEmailVerified(user)) {
            navigate('/verify-email', { replace: true, state: { email: user?.email, plan: planParam } });
            return;
          }

          // If plan query param is present, redirect to pricing page
          if (planParam) {
            navigate(`/pricing?plan=${encodeURIComponent(planParam)}`, { replace: true });
            return;
          }

          // Otherwise redirect based on verification and subscription status
          navigate(getVerifiedUserRedirectPath(user), { replace: true });
        } else {
          setIsRedirecting(false);
          if (planParam) {
            navigate('/pricing', { replace: true, state: { error: response.data.message || 'Authentication failed.' } });
          }
        }
      } catch (error) {
        if (isMounted) {
          setIsRedirecting(false);
          if (planParam) {
            navigate('/pricing', { replace: true, state: { error: error.response?.data?.message || 'Authentication error.' } });
          }
        }
      }
    };

    handleAppLogin();

    return () => {
      isMounted = false;
    };
  }, [nftoken, planParam, dispatch, navigate]);

  // Fetch plans
  useEffect(() => {
    let isMounted = true;
    const fetchPlans = async () => {
      try {
        const response = await axios.get('/api/v1/users/plans', { showLoader: false });
        if (response.data.isSuccess && isMounted) {
          setPlans(response.data.data);
        }
      } catch (error) {
        // Silent error
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchPlans();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isRedirecting) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="relative mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-20 h-20 border-4 border-custom-primary border-t-transparent rounded-full"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-3 h-3 bg-custom-primary rounded-full" />
          </motion.div>
        </div>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-white text-xl font-medium tracking-wide"
        >
          {t.auth.redirecting}
        </motion.p>
      </div>
    );
  }

  return (
    <main>
      <Hero />
      <Features />
      <About />
      <HomeTestimonials />
      
      <section id="pricing" className="pt-12 pb-24 sm:py-24 px-6 bg-custom-secondary text-center">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-custom-primary uppercase mb-8 sm:mb-16 tracking-tighter"
          >
            {t.pricing.title}
          </motion.h2>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-custom-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {plans.map((plan, idx) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -6 }}
                  className="bg-black/40 border border-white/10 p-10 flex flex-col items-center relative overflow-hidden group rounded-xl hover:border-white/30 transition-all duration-300"
                >
                  {idx === 1 && (
                    <div className="absolute top-0 right-0 bg-custom-primary text-black text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                      {t.pricing.best_value}
                    </div>
                  )}
                  
                  <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-4">
                    {plan.plan_name}
                  </h3>
                  
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-5xl font-bold text-custom-primary">{plan.monthly_price}</span>
                    <span className="text-2xl font-bold text-custom-primary">€</span>
                    <span className="text-white/40 text-sm uppercase tracking-widest ml-2">
                      / {idx === 0 ? t.pricing.monthly : t.pricing.yearly}
                    </span>
                  </div>

                  <ul className="text-white/60 space-y-4 mb-10 text-left w-full">
                    {t.pricing.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-custom-primary rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <motion.div 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full mt-auto"
                  >
                    <Link
                      to={currentUser ? `/pricing?plan=${encodeURIComponent(plan.plan_name)}` : `/login?plan=${encodeURIComponent(plan.plan_name)}`}
                      className="block w-full py-4 bg-custom-primary text-black text-center font-bold uppercase tracking-normal sm:tracking-widest hover:bg-white transition-colors rounded-sm cursor-pointer"
                    >
                      {t.pricing.cta}
                    </Link>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <HomeFaq />
      <FinalCta />
    </main>
  );
};

export default Home;