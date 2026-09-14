import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAppSettings } from '../useAppSettings';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { FaCheck, FaDesktop, FaChevronRight } from 'react-icons/fa';
import { findMatchingPlan } from '../utils/plan';
import { isEmailVerified } from '../utils/auth';
import axios from '../api/axios';
import { useSelector } from 'react-redux';

const Pricing = () => {
  const { theme, t, deviceId } = useAppSettings();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [countdown, setCountdown] = useState(null);

  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState(location.state?.error || '');
  const planParam = searchParams.get('plan');

  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

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

  useEffect(() => {
    let isMounted = true;

    const fetchPlans = async () => {
      try {
        const response = await axiosPrivate.get('/api/v1/payments/plans', { showLoader: false });
        if (response.data?.isSuccess && isMounted) {
          const fetchedPlans = Array.isArray(response.data.data?.plans)
            ? response.data.data.plans
            : Array.isArray(response.data.data)
            ? response.data.data
            : [];
          setPlans(fetchedPlans);
        }
      } catch (error) {
        // Fallback to public users/plans endpoint if payments/plans fails
        try {
          const fallbackRes = await axios.get('/api/v1/users/plans', { showLoader: false });
          if (fallbackRes.data?.isSuccess && isMounted) {
            setPlans(fallbackRes.data.data || []);
          }
        } catch (e) {
          // Silent error
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const checkSubscriptions = async () => {
      if (!currentUser?.email) return;
      try {
        const response = await axiosPrivate.get('/api/v1/payments/subscriptions', { showLoader: false });

        // If user already has active subscriptions, redirect to profile
        if (response.data?.isSuccess && response.data?.data && response.data.data.length > 0) {
          const hasActive = response.data.data.some(sub => sub.status === 'active' || sub.is_active === 1);
          if (hasActive) {
            navigate('/profile', { replace: true });
          }
        }
      } catch (error) {
        // Silent error
      }
    };

    fetchPlans();
    if (currentUser) {
      checkSubscriptions();
    }

    return () => {
      isMounted = false;
    };
  }, [axiosPrivate, currentUser, navigate]);

  // Main checkout proceed handler
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

    // If user is not logged in, redirect to login with plan information
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
    if (user?.is_reviewer == 1) {
      navigate('/reviewer-welcome', { replace: true });
      return;
    }

    // Check if already subscribed
    if (user?.is_subscribed == 1 && user?.is_reviewer == 0) {
      navigate('/profile', { replace: true });
      return;
    }

    // Authenticated and ready for checkout
    setSubscribing(true);
    setErrorMessage('');
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
        setErrorMessage(errorMsg);
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
        setErrorMessage(errorMsg);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "An error occurred during checkout. Please try again.";
      console.error("Error during checkout:", error);
      setSubscribing(false);
      setErrorMessage(errorMsg);
    }
  };

  // Card click / manual selection handler
  const handleCardClick = (plan) => {
    setSelectedPlan(plan);

    // If plan query param was passed, reset the 5-sec countdown for the newly selected plan
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
    } else {
      // If no plan query param, clicking directly selects and proceeds
      handleSelectPlan(plan);
    }
  };

  // Auto-select plan and 5-sec countdown when plan query param is present
  useEffect(() => {
    if (!planParam || loading || plans.length === 0 || autoProceedTriggeredRef.current) return;

    const matched = findMatchingPlan(plans, planParam);
    if (!matched) {
      setErrorMessage('Selected plan could not be found.');
      return;
    }

    setSelectedPlan(matched);

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
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [planParam, loading, plans]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-custom-bg pt-32 pb-24 px-6 overflow-hidden relative">
      {/* Checkout Transition Loader */}
      <AnimatePresence>
        {subscribing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-custom-bg/90 backdrop-blur-md"
          >
            <div className="text-center space-y-8">
              <div className="relative">
                <div className="w-24 h-24 border-2 border-custom-primary/20 rounded-full animate-ping absolute inset-0"></div>
                <div className="w-24 h-24 border-4 border-custom-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="space-y-2">
                <h2 className={`text-3xl font-bold uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                  {t.pricing.checkout}
                </h2>
                <p className={`${theme === 'dark' ? 'text-white/60' : 'text-black/60'} font-bold uppercase tracking-widest`}>
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

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-custom-primary uppercase tracking-tighter mb-4">
            {t.pricing.title}
          </h1>
          <p className={`text-xl max-w-2xl mx-auto ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>
            {t.pricing.description}
          </p>
          <div className="h-1 w-24 bg-custom-primary mx-auto mt-8"></div>
        </motion.div>

        {errorMessage && (
          <div className="max-w-xl mx-auto mb-10 p-4 rounded-xl bg-red-500/15 border border-red-500/40 text-red-500 font-bold text-center text-xs uppercase tracking-widest shadow-md">
            {errorMessage}
          </div>
        )}

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
                <p className={`${theme === 'dark' ? 'text-white' : 'text-black'} font-bold text-sm tracking-wide`}>
                  {t.pricing?.youSelectedThisPlan || "You selected this plan"}:{' '}
                  <span className="text-custom-primary uppercase font-extrabold">{selectedPlan.plan_name}</span>
                </p>
                {countdown !== null && countdown > 0 ? (
                  <p className={`${theme === 'dark' ? 'text-white/70' : 'text-black/70'} text-xs mt-1 flex items-center gap-1.5`}>
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
          <div className="max-w-5xl mx-auto flex flex-col space-y-6">
            {plans.map((plan, idx) => {
              const isSelected = selectedPlan?.id === plan.id;
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  whileHover={!subscribing ? { scale: 1.012, y: -3 } : {}}
                  whileTap={!subscribing ? { scale: 0.99 } : {}}
                  onClick={() => !subscribing && handleCardClick(plan)}
                  className={`group relative p-6 sm:p-8 rounded-xl border transition-all duration-300 ease-out cursor-pointer ${
                    isSelected
                      ? 'border-custom-primary bg-custom-primary/10 shadow-[0_0_40px_rgba(245,197,66,0.18)] ring-1 ring-custom-primary/40'
                      : `${theme === 'dark' ? 'border-neutral-800 bg-neutral-900/30' : 'border-neutral-200 bg-white/70'} hover:border-custom-primary hover:bg-custom-primary/[0.04] hover:shadow-[0_0_30px_rgba(245,197,66,0.12)]`
                  } ${subscribing ? 'opacity-50 cursor-default' : ''}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Plan Name & Plan Amount Billed */}
                    <div className="flex-1 min-w-[220px]">
                      <div className="flex items-center gap-3">
                        <h3 className={`text-xl sm:text-2xl font-bold uppercase tracking-wider transition-colors duration-300 ${
                          isSelected 
                            ? 'text-custom-primary' 
                            : theme === 'dark' 
                            ? 'text-white group-hover:text-custom-primary' 
                            : 'text-black group-hover:text-custom-primary'
                        }`}>
                          {plan.plan_name}
                        </h3>
                        {isSelected && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-custom-primary text-black font-bold uppercase tracking-widest animate-pulse">
                            {t.pricing.pSelected || "Selected"}
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-baseline gap-2">
                        <span className={`text-xs uppercase tracking-widest font-semibold ${theme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>
                          {t.pricing.pAmount}
                        </span>
                        <span className="text-xl sm:text-2xl font-bold text-custom-primary">
                          {plan.monthly_price}€
                        </span>
                        <span className={`text-xs uppercase tracking-wider ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>
                          {plan.duration_unit === 'month' 
                            ? `(${t.pricing.monthly || 'Billed monthly'})` 
                            : plan.duration_unit === 'year' 
                            ? `(${t.pricing.yearly || 'Billed yearly'})` 
                            : `(Billed per ${plan.duration_value} ${plan.duration_unit})`}
                        </span>
                      </div>
                    </div>

                    {/* Grey Line Separator that changes color on hover with transition */}
                    <div className="hidden md:block w-px h-14 bg-neutral-300 dark:bg-neutral-800 group-hover:bg-custom-primary transition-colors duration-300" />
                    <div className="block md:hidden w-full h-px bg-neutral-300 dark:bg-neutral-800 group-hover:bg-custom-primary transition-colors duration-300" />

                    {/* Check Duration Value & Duration Unit */}
                    <div className="flex items-center gap-3.5 min-w-[180px]">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${
                        isSelected
                          ? 'bg-custom-primary text-black'
                          : 'bg-custom-primary/15 text-custom-primary group-hover:bg-custom-primary group-hover:text-black'
                      }`}>
                        <FaCheck size={14} />
                      </div>
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className={`text-xl sm:text-2xl font-bold transition-colors duration-300 ${
                            theme === 'dark' ? 'text-white group-hover:text-custom-primary' : 'text-black group-hover:text-custom-primary'
                          }`}>
                            {plan.duration_value}
                          </span>
                          <span className={`text-sm sm:text-base font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-white/80' : 'text-black/80'}`}>
                            {plan.duration_value === 1
                              ? (plan.duration_unit === 'month' ? (t.pricing.monthly || 'Month') : plan.duration_unit === 'year' ? (t.pricing.yearly || 'Year') : plan.duration_unit)
                              : `${plan.duration_unit}s`}
                          </span>
                        </div>
                        <span className={`text-[11px] uppercase tracking-widest block font-medium ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>
                          {t.pricing.pDuration}
                        </span>
                      </div>
                    </div>

                    {/* Grey Line Separator that changes color on hover with transition */}
                    <div className="hidden md:block w-px h-14 bg-neutral-300 dark:bg-neutral-800 group-hover:bg-custom-primary transition-colors duration-300" />
                    <div className="block md:hidden w-full h-px bg-neutral-300 dark:bg-neutral-800 group-hover:bg-custom-primary transition-colors duration-300" />

                    {/* Screen Limit info */}
                    <div className="flex items-center gap-3 min-w-[130px]">
                      <FaDesktop className="text-custom-primary text-lg shrink-0" />
                      <div>
                        <span className={`text-sm font-bold block ${theme === 'dark' ? 'text-white/80' : 'text-black/80'}`}>
                          {plan.max_screens} Screens
                        </span>
                        <span className={`text-[11px] uppercase tracking-wider block font-medium ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>
                          {t.pricing.pSimultaneous}
                        </span>
                      </div>
                    </div>

                    {/* Action / Arrow indicator / Button */}
                    <div className="flex items-center justify-end md:ml-auto shrink-0">
                      {isSelected ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectPlan(plan);
                          }}
                          disabled={subscribing}
                          className="px-5 py-2.5 bg-custom-primary text-black font-bold text-xs uppercase tracking-wider rounded-lg shadow-md hover:bg-white transition-all cursor-pointer disabled:opacity-50"
                        >
                          {subscribing ? (t.pricing?.checkout || 'Processing...') : (t.pricing?.proceedNow || 'Proceed Now')}
                        </button>
                      ) : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border border-neutral-300 dark:border-neutral-800 text-neutral-400 group-hover:border-custom-primary group-hover:text-custom-primary group-hover:translate-x-1">
                          <FaChevronRight size={13} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Countdown Progress Bar on Selected Card (only when auto-countdown is running) */}
                  {isSelected && Boolean(planParam) && countdown !== null && countdown > 0 && (
                    <div className="w-full mt-5 p-2.5 rounded-lg bg-black/40 border border-custom-primary/30 text-center">
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

                  {/* Features line */}
                  {t.pricing.features && t.pricing.features.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-neutral-200/40 dark:border-neutral-800/60 flex flex-wrap gap-x-8 gap-y-2 text-xs">
                      {t.pricing.features.map((feature, fIdx) => (
                        <span key={fIdx} className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-custom-primary shrink-0"></span>
                          {feature}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Commitment note & What you get */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 max-w-5xl mx-auto space-y-6"
          >
            {/* Commitment Note */}
            <div className={`p-4 sm:p-5 rounded-xl border text-center text-xs sm:text-sm ${
              theme === 'dark'
                ? 'bg-neutral-900/40 border-neutral-800 text-white/70'
                : 'bg-white/80 border-neutral-200 text-black/70'
            }`}>
              <p className="leading-relaxed">
                {t.pricing.commitmentNote || 'No commitment. Cancel at any time in Settings > directly in the app at least 1 day before each renewal date.'}
              </p>
            </div>

            {/* What you get */}
            <div className={`p-6 sm:p-8 rounded-xl border ${
              theme === 'dark'
                ? 'bg-neutral-900/30 border-neutral-800'
                : 'bg-white/70 border-neutral-200 shadow-sm'
            }`}>
              <h4 className="text-sm font-bold uppercase tracking-widest text-custom-primary mb-6">
                {t.pricing.whatYouGetTitle || 'What you get'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3.5">
                  <span className="w-7 h-7 rounded-full bg-custom-primary/20 text-custom-primary font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <p className={`text-sm font-semibold leading-snug pt-0.5 ${theme === 'dark' ? 'text-white/90' : 'text-black/90'}`}>
                    {t.pricing.benefits?.[0] || 'Access to all workouts & programs'}
                  </p>
                </div>

                <div className="flex items-start gap-3.5">
                  <span className="w-7 h-7 rounded-full bg-custom-primary/20 text-custom-primary font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <p className={`text-sm font-semibold leading-snug pt-0.5 ${theme === 'dark' ? 'text-white/90' : 'text-black/90'}`}>
                    {t.pricing.benefits?.[1] || 'Step-by-step form cues for exercises'}
                  </p>
                </div>

                <div className="flex items-start gap-3.5">
                  <span className="w-7 h-7 rounded-full bg-custom-primary/20 text-custom-primary font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <p className={`text-sm font-semibold leading-snug pt-0.5 ${theme === 'dark' ? 'text-white/90' : 'text-black/90'}`}>
                    {t.pricing.benefits?.[2] || 'Cancel anytime'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Pricing;
