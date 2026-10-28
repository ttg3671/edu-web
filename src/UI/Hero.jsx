import React from 'react';
import { useAppSettings } from '../useAppSettings';
import { motion } from 'framer-motion';
import { FaPlay } from 'react-icons/fa';

const scrollToId = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

const Hero = () => {
  const { t } = useAppSettings();
  const hero = t.home.hero;

  return (
    <section id="home" className="relative w-full min-h-screen flex items-center bg-custom-bg pt-28 sm:pt-36 pb-20 overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute -top-40 -right-40 w-[36rem] h-[36rem] rounded-full bg-[var(--primary)]/10 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-48 -left-32 w-[28rem] h-[28rem] rounded-full bg-[var(--primary)]/5 blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-14 lg:gap-16">

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 text-center lg:text-left"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold uppercase leading-[1.05] tracking-tight text-custom-text mb-6">
              {hero.title}
            </h1>

            <p className="text-lg sm:text-xl font-medium text-custom-primary mb-5 max-w-2xl mx-auto lg:mx-0">
              {hero.subtitle}
            </p>

            <p className="text-base sm:text-lg leading-relaxed text-[var(--text)]/70 mb-10 max-w-2xl mx-auto lg:mx-0">
              {hero.desc}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => scrollToId('pricing')}
                className="px-8 py-4 bg-custom-primary text-black font-bold uppercase tracking-wider rounded-full shadow-[0_10px_30px_-10px_var(--primary)] cursor-pointer"
              >
                {hero.cta}
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => scrollToId('video')}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-[var(--text)]/20 text-custom-text font-semibold uppercase tracking-wider rounded-full hover:border-[var(--primary)] hover:text-custom-primary transition-colors cursor-pointer"
              >
                <FaPlay size={12} />
                {hero.secondary}
              </motion.button>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="lg:col-span-5 relative max-w-md w-full mx-auto"
          >
            <div className="absolute -inset-3 rounded-[2rem] border border-[var(--primary)]/40 rotate-3"></div>
            <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] shadow-2xl">
              <img
                src="/images/hero-900.webp"
                srcSet="/images/hero-480.webp 480w, /images/hero-900.webp 900w"
                sizes="(min-width: 1024px) 448px, 90vw"
                width="900"
                height="1201"
                fetchPriority="high"
                decoding="async"
                alt="Edu García"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
