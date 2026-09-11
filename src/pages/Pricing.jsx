import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppSettings } from '../useAppSettings';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { FaCheck, FaDesktop, FaChevronRight } from 'react-icons/fa';

import axios from '../api/axios';
import { useSelector } from 'react-redux';

const Pricing = () => {
  const { theme, t, deviceId } = useAppSettings();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.currentUser);
  const device = useSelector((state) => state.user.device);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axiosPrivate.get('/api/v1/payments/plans', { showLoader: false });
        // console.log(response.data);
        if (response.data.isSuccess) {
          setPlans(response.data.data.plans);
        }
      } catch (error) {
        // Silent error
      } finally {
        setLoading(false);
      }
    };

    const checkSubscriptions = async () => {
      if (!currentUser?.email) return;
      try {
        const response = await axiosPrivate.get('/api/v1/payments/subscriptions', { showLoader: false });

        // If user already has active subscriptions, redirect to profile
        if (response.data.isSuccess && response.data.data && response.data.data.length > 0) {
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
  }, [axiosPrivate, currentUser, navigate]);

  const handleSelectPlan = async (plan) => {
    setSelectedPlan(plan);
    setSubscribing(true);
    try {
      const selectedDevice = device || 'web';

      // Step 1: Request checkout options to obtain checksum
      const optionsRes = await axiosPrivate.post('/api/v1/payments/checkout-options', {
        plan: plan.plan_name,
        device_id: deviceId,
        device: selectedDevice
      });

      if (!optionsRes.data?.isSuccess) {
        alert(optionsRes.data?.message || "Failed to initiate checkout options.");
        setSubscribing(false);
        return;
      }

      const checksum = optionsRes.data?.data?.checksum;

      // Step 2: Send plan, device, and checksum to subscribe endpoint
      const response = await axiosPrivate.post('/api/v1/payments/subscribe', {
        plan: plan.plan_name,
        device: selectedDevice,
        device_id: deviceId,
        checksum: checksum
      });

      if (response.data?.isSuccess && response.data?.data?.url) {
        // Wait 1.5s for visual feedback before redirecting
        setTimeout(() => {
          window.location.href = response.data.data.url;
        }, 1500);
      } else {
        alert(response.data?.message || "Failed to initiate subscription.");
        setSubscribing(false);
      }
    } catch (error) {
      alert(error.response?.data?.message || "An error occurred. Please try again later.");
      setSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-custom-bg pt-32 pb-24 px-6 overflow-hidden relative">
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
                <h2 className={`text-3xl font-bold uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{t.pricing.checkout}</h2>
                <p className={`${theme === 'dark' ? 'text-white/60' : 'text-black/60'} font-bold uppercase tracking-widest`}>
                  {selectedPlan?.plan_name} — {selectedPlan?.monthly_price}€
                </p>
                <p className="text-custom-primary font-bold uppercase tracking-widest animate-pulse">{t.pricing.payment}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-custom-primary uppercase tracking-tighter mb-4">
            {t.pricing.title}
          </h1>
          <p className={`text-xl max-w-2xl mx-auto ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>
            {t.pricing.description}
          </p>
          <div className="h-1 w-24 bg-custom-primary mx-auto mt-8"></div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-custom-primary"></div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto flex flex-col space-y-6">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={!subscribing ? { scale: 1.012, y: -3 } : {}}
                whileTap={!subscribing ? { scale: 0.99 } : {}}
                onClick={() => !subscribing && handleSelectPlan(plan)}
                className={`group relative p-6 sm:p-8 rounded-xl border transition-all duration-300 ease-out cursor-pointer ${
                  selectedPlan?.id === plan.id
                    ? 'border-custom-primary bg-custom-primary/10 shadow-[0_0_40px_rgba(245,197,66,0.18)]'
                    : `${theme === 'dark' ? 'border-neutral-800 bg-neutral-900/30' : 'border-neutral-200 bg-white/70'} hover:border-custom-primary hover:bg-custom-primary/[0.04] hover:shadow-[0_0_30px_rgba(245,197,66,0.12)]`
                } ${subscribing ? 'opacity-50 cursor-default' : ''}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Plan Name & Plan Amount Billed */}
                  <div className="flex-1 min-w-[220px]">
                    <div className="flex items-center gap-3">
                      <h3 className={`text-xl sm:text-2xl font-bold uppercase tracking-wider transition-colors duration-300 ${
                        selectedPlan?.id === plan.id 
                          ? 'text-custom-primary' 
                          : theme === 'dark' 
                          ? 'text-white group-hover:text-custom-primary' 
                          : 'text-black group-hover:text-custom-primary'
                      }`}>
                        {plan.plan_name}
                      </h3>
                      {selectedPlan?.id === plan.id && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-custom-primary text-black font-bold uppercase tracking-widest">
                          {t.pricing.pSelected}
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
                      selectedPlan?.id === plan.id
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

                  {/* Action / Arrow indicator */}
                  <div className="hidden sm:flex items-center justify-end md:ml-auto shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      selectedPlan?.id === plan.id
                        ? 'bg-custom-primary text-black'
                        : 'border border-neutral-300 dark:border-neutral-800 text-neutral-400 group-hover:border-custom-primary group-hover:text-custom-primary group-hover:translate-x-1'
                    }`}>
                      <FaChevronRight size={13} />
                    </div>
                  </div>
                </div>

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
            ))}
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
