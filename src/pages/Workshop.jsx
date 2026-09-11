import React from 'react';
import { motion } from 'framer-motion';

const Workshop = () => {
  return (
    <div className="min-h-screen pt-40 px-6 flex flex-col items-center justify-center bg-custom-bg text-custom-text">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-6xl font-medium mb-8"
      >
        Workshop
      </motion.h1>
      <p className="text-lg text-custom-text/70 max-w-2xl text-center font-normal">
        Join our exclusive workshops to deepen your understanding of movement, nutrition, and mindset.
      </p>
    </div>
  );
};

export default Workshop;
