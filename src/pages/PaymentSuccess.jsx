import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppSettings } from '../useAppSettings';
import { FaCheckCircle, FaSpinner, FaExclamationCircle } from 'react-icons/fa';
import { useSubscriptionSync } from '../hooks/useSubscriptionSync';

const PaymentSuccess = () => {
  const { theme } = useAppSettings();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { status, data } = useSubscriptionSync(sessionId);

  // useEffect(() => {
  //   console.log('PaymentSuccess Status:', status);
  //   console.log('PaymentSuccess Data:', data);
  // }, [status, data]);

  const handleReturn = () => {
    // This will force the mobile OS to wake up your Flutter app
    window.location.href = `edugarciamovimiento://callback?screen=payment-success`;
  };

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        handleReturn();
      }, 5000); // Redirect after 3 seconds so user can see success message
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-custom-bg px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center space-y-8 p-10 bg-black/20 border border-custom-primary/30 rounded-2xl backdrop-blur-sm"
      >
        <div className="flex justify-center">
          {status === 'loading' && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <FaSpinner className="text-custom-primary text-8xl" />
            </motion.div>
          )}
          {status === 'success' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <FaCheckCircle className="text-custom-primary text-8xl" />
            </motion.div>
          )}
          {status === 'error' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <FaExclamationCircle className="text-red-500 text-8xl" />
            </motion.div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-white uppercase tracking-tighter">
            {status === 'loading' ? 'Verifying...' : status === 'success' ? 'Payment Successful!' : 'Verification Failed'}
          </h2>
          <p className={`text-lg ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>
            {status === 'loading' 
              ? 'Please wait while we confirm your subscription status.' 
              : status === 'success' 
                ? 'Thank you for joining the movement. Your subscription is now active.' 
                : 'We could not verify your subscription. Please contact support if you were charged.'}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="pt-6 space-y-4"
        >
          {status === 'success' && (
            <>
              <button
                onClick={handleReturn}
                className="inline-block w-full py-4 bg-custom-primary text-black font-bold uppercase tracking-widest hover:bg-white transition-all mb-4"
              >
                Return to App
              </button>
              <Link
                to="/profile"
                className="inline-block w-full py-4 bg-white/10 text-white font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all mb-4"
              >
                Go to Profile
              </Link>
            </>
          )}
          <Link
            to="/"
            className={`inline-block w-full py-4 ${status === 'success' ? 'bg-white/5 text-white/50' : 'bg-custom-primary text-black'} font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all`}
          >
            {status === 'loading' ? 'Processing...' : 'Go to Dashboard'}
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
