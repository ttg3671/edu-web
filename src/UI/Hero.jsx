import React from 'react';
import { useAppSettings } from '../useAppSettings';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Hero = () => {
  const { theme, t } = useAppSettings();

  const btnShadow = theme === 'dark' 
    ? "shadow-[0_0_15px_rgba(245,197,66,0.15)]" 
    : "shadow-[0_0_15px_rgba(212,160,23,0.15)]";

  return (
    <section id="home" className="relative w-full min-h-screen flex items-center bg-custom-bg pt-20 sm:pt-32 pb-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 w-full">
        
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          
          {/* Left Side: Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 text-center z-10 px-6 sm:px-12"
          >
            <motion.h1
              className="text-sm sm:text-base font-medium text-custom-primary uppercase tracking-[0.2em] mb-4 px-4"
            >              {t.hero.title}
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-custom-text mb-10 font-bold leading-tight px-4 sm:px-10"
            >
              {t.hero.subtitle}
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex justify-center"
            >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    to="/login"
                    className={`inline-block px-10 py-4 bg-custom-primary text-black font-bold uppercase tracking-normal sm:tracking-widest rounded-none hover:bg-black hover:text-custom-primary border-2 border-custom-primary transition-all cursor-pointer ${btnShadow}`}
                  >
                    {t.hero.cta}
                  </Link>
                </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Side: Image */}
          <motion.div 
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="flex-1 relative max-w-md w-full mx-auto"
          >
            <div className="absolute -inset-4 bg-custom-primary/10 -rotate-2 z-0 rounded-lg"></div>
            <div className="relative z-10 border-4 border-custom-secondary shadow-2xl overflow-hidden rounded-sm aspect-[4/5]">
              <img 
                src="https://www.edugarciamovimiento.com/public/img-0683-1-1.jpg" 
                alt="Eduardo Garcia Movement" 
                loading="lazy"
                className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
              />
            </div>
          </motion.div>
        </div>

      </div>
      
      {/* Bottom Accent */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-custom-primary"></div>
    </section>
  );
};

export default Hero;
