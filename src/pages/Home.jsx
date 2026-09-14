import React, { useEffect, useState, useRef } from 'react';
import Hero from '../UI/Hero';
import Features from '../UI/Features';
import Testimonials from '../components/Testimonials';
import { useAppSettings } from '../useAppSettings';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../api/axios';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentUser, setToken, setDevice } from '../redux/user/user.actions';
import { isEmailVerified, getVerifiedUserRedirectPath } from '../utils/auth';
import { findMatchingPlan } from '../utils/plan';
import { FaCheck } from 'react-icons/fa';

const Home = () => {
  const { t, deviceId } = useAppSettings();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [countdown, setCountdown] = useState(null);

  const [searchParams] = useSearchParams();
  const nftoken = searchParams.get('nftoken');
  const planParam = searchParams.get('plan');

  const [authCompleted, setAuthCompleted] = useState(!nftoken);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();

  const currentUser = useSelector((state) => state.user.currentUser);
  const accessToken = useSelector((state) => state.user.accessToken);
  const device = useSelector((state) => state.user.device);

  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;

  const accessTokenRef = useRef(accessToken);
  accessTokenRef.current = accessToken;

  const deviceRef = useRef(device);
  deviceRef.current = device;

  const countdownIntervalRef = useRef(null);
  const autoProceedTriggeredRef = useRef(false);

  // Handle mobile app login via nftoken
  useEffect(() => {
    if (!nftoken) {
      setAuthCompleted(true);
      return;
    }

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

          // If plan param is NOT provided, redirect as usual
          if (!planParam) {
            navigate(getVerifiedUserRedirectPath(user), { replace: true });
            return;
          }

          // If plan param IS provided, stay on home page to show selected plan
          setIsRedirecting(false);
          setAuthCompleted(true);
        } else {
          setIsRedirecting(false);
          setAuthCompleted(true);
          if (planParam) {
            navigate('/pricing', { replace: true, state: { error: response.data.message || 'Authentication failed.' } });
          }
        }
      } catch (error) {
        if (isMounted) {
          setIsRedirecting(false);
          setAuthCompleted(true);
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

  // Main function: handleSelectPlan (proceeds to checkout, or redirects back to pricing on error)
  const handleSelectPlan = async (planToProceed) => {
    if (!planToProceed) return;

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(null);
    autoProceedTriggeredRef.current = true;

    const user = currentUserRef.current;
    const token = accessTokenRef.current;
    const dev = deviceRef.current;

    // If user is not logged in, direct to login with plan information
    if (!user && !token) {
      navigate(`/login?plan=${encodeURIComponent(planToProceed.plan_name)}`, {
        state: {
          plan: planToProceed.plan_name,
          planId: planToProceed.id
        }
      });
      return;
    }

    // Check email verification
    if (!isEmailVerified(user)) {
      navigate('/verify-email', {
        replace: true,
        state: { email: user?.email, plan: planToProceed.plan_name }
      });
      return;
    }

    // Check reviewer status
    if (user.is_reviewer == 1) {
      navigate('/reviewer-welcome', { replace: true });
      return;
    }

    // Check if already subscribed
    if (user.is_subscribed == 1 && user.is_reviewer == 0) {
      navigate('/profile', { replace: true });
      return;
    }

    // Authenticated and ready for checkout
    setSubscribing(true);
    try {
      const selectedDevice = dev || 'web';

      // Step 1: Request checkout options to obtain checksum
      const optionsRes = await axiosPrivate.post('/api/v1/payments/checkout-options', {
        plan: planToProceed.plan_name,
        device_id: deviceId,
        device: selectedDevice
      });

      if (!optionsRes.data?.isSuccess) {
        const errorMsg = optionsRes.data?.message || "Failed to initiate checkout options.";
        console.error("Checkout options failed:", errorMsg);
        setSubscribing(false);
        navigate('/pricing', { replace: true, state: { error: errorMsg } });
        return;
      }

      const checksum = optionsRes.data?.data?.checksum;

      // Step 2: Send plan, device, and checksum to subscribe endpoint
      const response = await axiosPrivate.post('/api/v1/payments/subscribe', {
        plan: planToProceed.plan_name,
        device: selectedDevice,
        device_id: deviceId,
        checksum: checksum
      });

      if (response.data?.isSuccess && response.data?.data?.url) {
        setTimeout(() => {
          window.location.href = response.data.data.url;
        }, 1200);
      } else {
        const errorMsg = response.data?.message || "Failed to initiate subscription.";
        console.error("Subscription failed:", errorMsg);
        setSubscribing(false);
        navigate('/pricing', { replace: true, state: { error: errorMsg } });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "An error occurred during checkout. Please try again.";
      console.error("Error during checkout:", error);
      setSubscribing(false);
      navigate('/pricing', { replace: true, state: { error: errorMsg } });
    }
  };

  // Card click / selection handler
  const handleCardClick = (plan) => {
    setSelectedPlan(plan);

    // If plan query param was passed, reset the countdown for the newly selected plan
    if (planParam) {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      autoProceedTriggeredRef.current = false;
      setCountdown(5);

      let timeLeft = 5;
      countdownIntervalRef.current = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);

        if (timeLeft <= 0) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
          autoProceedTriggeredRef.current = true;
          handleSelectPlan(plan);
        }
      }, 1000);
    }
  };

  // Auto-select plan and 5-sec countdown only when plan query param is present and not null
  // Automatically runs handleSelectPlan after 5 seconds, or redirects to /pricing on error
  useEffect(() => {
    if (!planParam || loading || plans.length === 0 || autoProceedTriggeredRef.current) return;
    if (nftoken && !authCompleted) return;

    const matched = findMatchingPlan(plans, planParam);
    if (!matched) {
      // If plan query param exists but cannot be matched, redirect back to pricing page
      navigate('/pricing', { replace: true, state: { error: 'Selected plan could not be found.' } });
      return;
    }

    setSelectedPlan(matched);

    // Smoothly scroll to the pricing section so user sees the selected plan
    const timerScroll = setTimeout(() => {
      const pricingElem = document.getElementById('pricing');
      if (pricingElem) {
        pricingElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);

    // Start 5-second countdown to auto-run handleSelectPlan
    setCountdown(5);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    let timeLeft = 5;
    countdownIntervalRef.current = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
        autoProceedTriggeredRef.current = true;
        handleSelectPlan(matched);
      }
    }, 1000);

    return () => {
      clearTimeout(timerScroll);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [planParam, loading, plans, authCompleted, nftoken, navigate]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
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
      
      {/* Checkout Transition Loader */}
      <AnimatePresence>
        {subscribing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md"
          >
            <div className="text-center space-y-8">
              <div className="relative">
                <div className="w-24 h-24 border-2 border-custom-primary/20 rounded-full animate-ping absolute inset-0"></div>
                <div className="w-24 h-24 border-4 border-custom-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold uppercase tracking-tighter text-white">
                  {t.pricing.checkout}
                </h2>
                <p className="text-white/60 font-bold uppercase tracking-widest">
                  {selectedPlan?.plan_name} — {selectedPlan?.monthly_price}€
                </p>
                <p className="text-custom-primary font-bold uppercase tracking-widest animate-pulse">
                  {t.pricing.payment}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Testimonials />
      
      <section id="pricing" className="pt-12 pb-24 sm:py-24 px-6 bg-custom-secondary text-center scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-custom-primary uppercase mb-8 sm:mb-12 tracking-tighter"
          >
            {t.pricing.title}
          </motion.h2>

          {/* Banner notification shown only when plan query param is present and plan is selected */}
          {Boolean(planParam) && selectedPlan && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 p-5 rounded-2xl border border-custom-primary/40 bg-custom-primary/10 backdrop-blur-md max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_35px_rgba(245,197,66,0.15)]"
            >
              <div className="flex items-center gap-3.5 text-left">
                <div className="w-10 h-10 rounded-full bg-custom-primary text-black flex items-center justify-center font-bold shrink-0">
                  <FaCheck size={16} />
                </div>
                <div>
                  <p className="text-white font-bold text-sm tracking-wide">
                    {t.pricing?.youSelectedThisPlan || "You selected this plan"}:{' '}
                    <span className="text-custom-primary uppercase font-extrabold">{selectedPlan.plan_name}</span>
                  </p>
                  {countdown !== null && countdown > 0 ? (
                    <p className="text-white/70 text-xs mt-1 flex items-center gap-1.5">
                      <span>{t.pricing?.autoProceedingIn || "Proceeding automatically in"}</span>
                      <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-custom-primary text-black font-bold text-xs">
                        {countdown}s
                      </span>
                      <span>({t.pricing?.seconds || "seconds"})...</span>
                    </p>
                  ) : (
                    <p className="text-custom-primary text-xs mt-1 animate-pulse font-medium">
                      {subscribing ? (t.pricing?.payment || "Redirecting to Secure Payment...") : ""}
                    </p>
                  )}
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => handleSelectPlan(selectedPlan)}
                disabled={subscribing}
                className="w-full sm:w-auto px-6 py-3 bg-custom-primary text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-all rounded-md cursor-pointer shadow-lg disabled:opacity-50 shrink-0"
              >
                {subscribing ? (t.pricing?.checkout || 'Processing...') : (t.pricing?.proceedNow || 'Proceed Now')}
              </motion.button>
            </motion.div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-custom-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {plans.map((plan, idx) => {
                const isSelected = selectedPlan?.id === plan.id;
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -6 }}
                    onClick={() => handleCardClick(plan)}
                    className={`p-10 flex flex-col items-center relative overflow-hidden group rounded-xl transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'border-2 border-custom-primary bg-custom-primary/10 shadow-[0_0_45px_rgba(245,197,66,0.22)] ring-1 ring-custom-primary/40 scale-[1.02]'
                        : 'bg-black/40 border border-white/10 hover:border-white/30'
                    }`}
                  >
                    {/* Best Value badge for second plan when not selected */}
                    {idx === 1 && !isSelected && (
                      <div className="absolute top-0 right-0 bg-custom-primary text-black text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                        {t.pricing.best_value}
                      </div>
                    )}

                    {/* "You selected this plan" badge */}
                    {isSelected && (
                      <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-custom-primary text-black text-xs font-extrabold uppercase tracking-wider shadow-md animate-pulse">
                        <FaCheck size={12} />
                        <span>{t.pricing?.youSelectedThisPlan || "You selected this plan"}</span>
                      </div>
                    )}

                    <h3 className={`text-xl font-bold uppercase tracking-widest mb-4 ${isSelected ? 'text-custom-primary' : 'text-white'}`}>
                      {plan.plan_name}
                    </h3>
                    
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-5xl font-bold text-custom-primary">{plan.monthly_price}</span>
                      <span className="text-2xl font-bold text-custom-primary">€</span>
                      <span className="text-white/40 text-sm uppercase tracking-widest ml-2">
                        / {idx === 0 ? t.pricing.monthly : t.pricing.yearly}
                      </span>
                    </div>

                    {/* Countdown Progress Bar on Selected Card (only when auto-countdown is running) */}
                    {isSelected && Boolean(planParam) && countdown !== null && countdown > 0 && (
                      <div className="w-full mb-6 p-2.5 rounded-lg bg-black/40 border border-custom-primary/30 text-center">
                        <p className="text-xs text-custom-primary font-semibold tracking-wide">
                          {t.pricing?.autoProceedingIn || "Proceeding automatically in"}{' '}
                          <span className="font-bold text-white text-sm">{countdown}s</span>
                        </p>
                        <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                          <motion.div
                            key={plan.id}
                            className="bg-custom-primary h-full rounded-full"
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{ duration: 5, ease: "linear" }}
                          />
                        </div>
                      </div>
                    )}

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
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPlan(plan);
                        }}
                        disabled={subscribing}
                        className={`block w-full py-4 text-center font-bold uppercase tracking-normal sm:tracking-widest transition-all rounded-sm cursor-pointer disabled:opacity-50 ${
                          isSelected
                            ? 'bg-custom-primary text-black hover:bg-white shadow-[0_0_25px_rgba(245,197,66,0.3)]'
                            : 'bg-custom-primary/20 text-white hover:bg-custom-primary hover:text-black border border-custom-primary/30'
                        }`}
                      >
                        {isSelected
                          ? (subscribing ? (t.pricing?.checkout || 'Processing...') : (t.pricing?.proceedNow || 'Proceed Now'))
                          : t.pricing.cta}
                      </button>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Home;