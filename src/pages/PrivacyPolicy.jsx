import React from 'react';
import { motion } from 'framer-motion';
import { useAppSettings } from '../useAppSettings';

const PrivacyPolicy = () => {
  const { theme, t } = useAppSettings();

  return (
    <div className="min-h-screen bg-custom-bg pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-custom-primary uppercase tracking-tighter mb-4 leading-tight">
            {t.privacy.title}
          </h1>
          <div className="h-1 w-24 bg-custom-primary mx-auto"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`space-y-12 ${theme === 'dark' ? 'text-white/80' : 'text-black/80'}`}
        >
          {t.privacy.sections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h2 className="text-2xl font-bold text-custom-primary uppercase tracking-tight">
                {section.title}
              </h2>
              <div className="text-lg leading-relaxed whitespace-pre-wrap">
                {section.content}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
