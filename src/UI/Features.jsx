import React from 'react';
import { useAppSettings } from '../useAppSettings';
import { FaPlay } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Features = () => {
  const { theme, t } = useAppSettings();

  return (
    <section id="programs" className="py-24 px-6 bg-custom-bg overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-center mb-12 sm:mb-24 uppercase tracking-tighter text-custom-text"
        >
          {t.features.main_title}
        </motion.h2>

        {/* Section 1: Text Left, Video Right */}
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20 mb-32">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 space-y-6"
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-custom-primary uppercase tracking-tight">
              {t.features.section1.title}
            </h3>
            <p className="text-custom-text/70 text-lg leading-relaxed">
              {t.features.section1.desc1}
            </p>
            <p className="text-custom-text/70 text-lg leading-relaxed">
              {t.features.section1.desc2}
            </p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="pt-4"
            >
              <Link 
                to="/login"
                className="inline-block px-8 py-3 border-2 border-custom-primary text-custom-primary hover:bg-custom-primary hover:text-black transition-all uppercase tracking-normal sm:tracking-widest text-sm font-bold cursor-pointer"
              >
                {t.features.section1.cta}
              </Link>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 w-full aspect-video bg-custom-secondary/20 rounded-2xl overflow-hidden border border-white/10 relative group shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-20 h-20 bg-custom-primary rounded-full flex items-center justify-center text-black cursor-pointer shadow-[0_0_30px_rgba(245,197,66,0.4)] transition-all"
              >
                <FaPlay size={28} className="ml-1" />
              </motion.div>
            </div>
            {/* Background pattern for placeholder feel */}
            <div className="absolute bottom-6 left-6 right-6">
                <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-custom-primary"></div>
                </div>
            </div>
          </motion.div>
        </div>

        {/* Section 2: Image Left, Text Right */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-20">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 space-y-6"
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-custom-primary uppercase tracking-tight">
              {t.features.section2.title}
            </h3>
            <div className="space-y-4 text-custom-text/70 text-base lg:text-lg leading-relaxed">
              <p>
                {t.features.section2.p1}
              </p>
              <p>
                {t.features.section2.p2}
              </p>
              <p>
                {t.features.section2.p3}
              </p>
              <p>
                {t.features.section2.p4}
              </p>
              <p>
                {t.features.section2.p5}
              </p>
            </div>
            <div className="flex gap-4 pt-4">
               <div className="text-center">
                  <span className="block text-3xl font-bold text-custom-text">10+</span>
                  <span className="text-xs text-custom-primary uppercase tracking-widest">{t.features.section2.stats.years}</span>
               </div>
               <div className="w-px h-12 bg-white/10"></div>
               <div className="text-center">
                  <span className="block text-3xl font-bold text-custom-text">5k+</span>
                  <span className="text-xs text-custom-primary uppercase tracking-widest">{t.features.section2.stats.students}</span>
               </div>
               <div className="w-px h-12 bg-white/10"></div>
               <div className="text-center">
                  <span className="block text-3xl font-bold text-custom-text">15</span>
                  <span className="text-xs text-custom-primary uppercase tracking-widest">{t.features.section2.stats.countries}</span>
               </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 w-full relative"
          >
            <div className="absolute -inset-4 bg-custom-primary/5 rounded-3xl -rotate-2"></div>
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <img 
                src="https://www.edugarciamovimiento.com/public/selfiplaya.jpg" 
                alt="Eduardo Garcia at the beach" 
                loading="lazy"
                className="w-full h-full object-cover aspect-[4/5] hover:scale-105 transition-transform duration-700"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Features;
