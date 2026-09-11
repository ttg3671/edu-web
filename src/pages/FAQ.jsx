import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAppSettings } from '../useAppSettings';

const FAQItem = ({ question, answer, isOpen, onClick, theme }) => {
  return (
    <div className={`border-b ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}>
      <button
        onClick={onClick}
        className="w-full py-6 flex justify-between items-center text-left hover:text-custom-primary transition-colors group cursor-pointer"
      >
        <span className="text-lg md:text-xl font-bold uppercase tracking-tight pr-8">
          {question}
        </span>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${theme === 'dark' ? 'border-white/20' : 'border-black/10'} group-hover:border-custom-primary transition-colors cursor-pointer`}>
          {isOpen ? <FaMinus size={12} /> : <FaPlus size={12} />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className={`pb-6 text-lg leading-relaxed ${theme === 'dark' ? 'text-white/70' : 'text-black/70'}`}>
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  const { theme, t } = useAppSettings();
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="min-h-screen bg-custom-bg pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-custom-primary uppercase tracking-tighter mb-4">
            {t.faq.title}
          </h1>
          <p className={`text-lg uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>
            {t.faq.subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          {t.faq.questions.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.q}
              answer={faq.a}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
              theme={theme}
            />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-20 text-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <Link
              to="/login"
              className="px-12 py-5 bg-custom-primary text-black font-bold uppercase tracking-widest hover:bg-black hover:text-custom-primary border-2 border-custom-primary transition-all shadow-[0_0_30px_rgba(245,197,66,0.2)]"
            >
              {t.faq.cta}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQ;
