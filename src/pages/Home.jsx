import React, { useEffect, useState } from 'react';
import Hero from '../UI/Hero';
import Features from '../UI/Features';
import Testimonials from '../components/Testimonials';
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
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    const nftoken = searchParams.get('nftoken');

    if (nftoken) {
      setIsRedirecting(true);
      const handleAppLogin = async () => {
        try {
          const response = await axios.post('/api/v1/payments/index', {
            token: nftoken
          }, { showLoader: false });

          if (response.data.isSuccess) {
            const { user, accessToken, device_id, device } = response.data.data;

            if (device_id) {
              localStorage.setItem('device_id', device_id);
            }

            if (device) {
              dispatch(setDevice(device));
            }

            // Store user object and accessToken separately in Redux
            dispatch(setCurrentUser(user));
            dispatch(setToken(accessToken));
            
            // Clean up URL and redirect based on role and verification
            if (!isEmailVerified(user)) {
              navigate('/verify-email', { replace: true, state: { email: user?.email } });
            } else {
              navigate(getVerifiedUserRedirectPath(user), { replace: true });
            }
          } else {
            setIsRedirecting(false);
          }
        } catch (error) {
          setIsRedirecting(false);
        }
      };
      handleAppLogin();
    }
  }, [searchParams, dispatch, navigate]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get('/api/v1/users/plans', { showLoader: false });
        if (response.data.isSuccess) {
          setPlans(response.data.data);
        }
      } catch (error) {
        // Silent error
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
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
      
      {/* Podcasts Section */}
      {/*<section id="podcasts" className="pt-12 pb-24 sm:py-24 px-6 bg-custom-bg">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex-1 space-y-8"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-custom-primary uppercase tracking-tighter leading-tight">
                {t.podcasts.title}
              </h2>
              <p className="text-custom-text/70 text-lg lg:text-xl leading-relaxed">
                {t.podcasts.desc1}
              </p>
              <p className="text-custom-text/60 text-base leading-relaxed italic">
                {t.podcasts.desc2}
              </p>
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="pt-4"
              >
                <div className="flex items-center gap-4 text-custom-primary">
                  <div className="h-px w-12 bg-custom-primary/30"></div>
                  <span className="uppercase tracking-[0.3em] text-xs font-bold">{t.podcasts.tag}</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex-1 w-full h-[300px] sm:h-auto sm:aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group bg-black"
            >
              <iframe 
                className="w-full h-full"
                src="https://www.youtube.com/embed/iSjW1DEV5D8" 
                title="Eduardo Garcia Podcast Interview"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
              ></iframe>
            </motion.div>
          </div>
        </div>
      </section>*/}
      
      <Testimonials />
      
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
                  whileHover={{ y: -10 }}
                  className="bg-black/40 border border-white/10 p-10 flex flex-col items-center relative overflow-hidden group"
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
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full"
                  >
                    <Link
                      to="/login"
                      className="block w-full py-4 bg-custom-primary text-black text-center font-bold uppercase tracking-normal sm:tracking-widest hover:bg-white transition-colors cursor-pointer"
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
    </main>
  );
};

export default Home;