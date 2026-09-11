import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSettings } from '../useAppSettings';
import { FaTimesCircle } from 'react-icons/fa';

const PaymentCancel = () => {
  const { theme } = useAppSettings();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    console.log('Payment Cancelled Page Loaded');
  }, []);

  const handleReturn = () => {
    // This will force the mobile OS to wake up your Flutter app
    window.location.href = "edugarciamovimiento://callback?screen=payment-canceled";
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const redirect = setTimeout(() => {
      handleReturn();
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-custom-bg px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center space-y-8 p-10 bg-black/20 border border-red-500/30 rounded-2xl backdrop-blur-sm"
      >
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          >
            <FaTimesCircle className="text-red-500 text-8xl" />
          </motion.div>
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-white uppercase tracking-tighter">
            Payment Cancelled
          </h2>
          <p className={`text-lg ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>
            The payment process was cancelled. No charges were made.
          </p>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-custom-primary/80' : 'text-custom-primary'}`}>
            Redirecting to App in {countdown} seconds...
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="pt-6 space-y-4"
        >
          <button
            onClick={handleReturn}
            className="inline-block w-full py-4 bg-custom-primary text-black font-bold uppercase tracking-widest hover:bg-white transition-all"
          >
            Return to App
          </button>
          <Link
            to="/pricing"
            className="inline-block w-full py-4 bg-white/10 text-white font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
          >
            Try Again Now
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PaymentCancel;
