import React from 'react';
import { motion } from 'framer-motion';
import { FaGooglePlay, FaApple } from 'react-icons/fa';
import { useAppSettings } from '../useAppSettings';

const ReviewerWelcome = () => {
  const { theme } = useAppSettings();

  return (
    <div className="min-h-screen flex items-center justify-center bg-custom-bg px-6 py-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`max-w-2xl w-full text-center space-y-12 p-12 shadow-[0_0_50px_rgba(0,0,0,0.1)] border border-dotted ${theme === 'dark' ? 'border-white/20' : 'border-black/10'}`}
      >
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-custom-primary uppercase tracking-tighter">
            Welcome Back!
          </h1>
          <p className={`text-xl md:text-2xl ${theme === 'dark' ? 'text-white/80' : 'text-black/80'}`}>
            Please try our app for the best experience.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-6 pt-4">
          <motion.a
            href="#"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-black text-white border-2 border-white/10 hover:border-custom-primary transition-all rounded-xl"
          >
            <FaGooglePlay size={24} className="text-custom-primary" />
            <div className="text-left">
              <p className="text-[10px] uppercase font-bold leading-none">Get it on</p>
              <p className="text-xl font-bold leading-none">Google Play</p>
            </div>
          </motion.a>

          <motion.a
            href="#"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-black text-white border-2 border-white/10 hover:border-custom-primary transition-all rounded-xl"
          >
            <FaApple size={28} className="text-custom-primary" />
            <div className="text-left">
              <p className="text-[10px] uppercase font-bold leading-none">Download on the</p>
              <p className="text-xl font-bold leading-none">App Store</p>
            </div>
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
};

export default ReviewerWelcome;
