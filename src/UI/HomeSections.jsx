import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus } from 'react-icons/fa';
import { useAppSettings } from '../useAppSettings';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7 },
};

// "programs" id is the target of the navbar "About us" link
export const About = () => {
  const { t } = useAppSettings();
  const about = t.home.about;

  return (
    <section id="programs" className="py-24 px-6 bg-[var(--text)]/[0.03] overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
        <motion.div {...fadeUp} className="relative max-w-md w-full mx-auto">
          <div className="absolute -inset-3 rounded-[2rem] bg-[var(--primary)]/10 -rotate-3"></div>
          <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] shadow-2xl">
            <img
              src="/images/edu-beach-900.webp"
              srcSet="/images/edu-beach-480.webp 480w, /images/edu-beach-900.webp 900w"
              sizes="(min-width: 1024px) 448px, 90vw"
              width="900"
              height="1600"
              alt={about.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
        </motion.div>

        <motion.div {...fadeUp} className="space-y-6">
          <span className="text-sm font-semibold uppercase tracking-[0.25em] text-custom-primary">{about.eyebrow}</span>
          <h2 className="text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-custom-text">{about.name}</h2>
          <p className="text-xl font-medium text-custom-text">{about.role}</p>
          <div className="space-y-4 text-base sm:text-lg leading-relaxed text-[var(--text)]/70">
            <p>{about.p1}</p>
            <p>{about.p2}</p>
            <p>{about.p3}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            {about.stats.map((stat) => (
              <div key={stat.value} className="p-6 rounded-2xl bg-custom-bg border border-[var(--text)]/10">
                <span className="block text-4xl font-extrabold text-custom-primary mb-2">{stat.value}</span>
                <span className="text-sm leading-snug text-[var(--text)]/70">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export const HomeTestimonials = () => {
  const { t } = useAppSettings();

  return (
    <section className="py-24 px-6 bg-custom-bg">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          {...fadeUp}
          className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-center text-custom-text max-w-4xl mx-auto mb-14"
        >
          {t.home.testimonials.title}
        </motion.h2>

        <motion.div
          {...fadeUp}
          className="relative w-full aspect-video rounded-3xl overflow-hidden border border-[var(--text)]/10 shadow-2xl bg-black"
        >
          <iframe
            className="absolute inset-0 w-full h-full"
            src="https://player.vimeo.com/video/1176555172?title=0&byline=0&portrait=0"
            title="Testimonios"
            frameBorder="0"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
            allowFullScreen
          />
        </motion.div>
      </div>
    </section>
  );
};

export const HomeFaq = () => {
  const { t } = useAppSettings();
  const faq = t.home.faq;
  const [open, setOpen] = useState(0);

  return (
    <section id="home-faq" className="py-24 px-6 bg-custom-bg">
      <div className="max-w-3xl mx-auto">
        <motion.h2
          {...fadeUp}
          className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-center text-custom-text mb-12"
        >
          {faq.title}
        </motion.h2>

        <div className="space-y-4">
          {faq.questions.map((item, idx) => {
            const isOpen = open === idx;
            return (
              <div
                key={item.q}
                className={`rounded-2xl border transition-colors ${isOpen ? 'border-[var(--primary)]/60 bg-[var(--text)]/[0.04]' : 'border-[var(--text)]/10'}`}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-6 p-6 text-left cursor-pointer"
                >
                  <span className="text-base sm:text-lg font-semibold text-custom-text">{item.q}</span>
                  <FaPlus
                    size={14}
                    className={`shrink-0 text-custom-primary transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-6 whitespace-pre-line leading-relaxed text-[var(--text)]/70">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const FinalCta = () => {
  const { t } = useAppSettings();
  const finalCta = t.home.finalCta;

  return (
    <section className="px-6 pb-24 bg-custom-bg">
      <motion.div
        {...fadeUp}
        className="relative max-w-6xl mx-auto rounded-[2.5rem] overflow-hidden bg-custom-primary px-8 py-16 sm:px-16 sm:py-20 text-center"
      >
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/20 blur-2xl"></div>
        <p className="relative text-2xl sm:text-4xl font-extrabold leading-tight text-black max-w-4xl mx-auto mb-10">
          {finalCta.text}
        </p>
        <motion.button
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
          className="relative px-8 py-4 bg-black text-white font-bold uppercase tracking-wider rounded-full cursor-pointer"
        >
          {finalCta.cta}
        </motion.button>
      </motion.div>
    </section>
  );
};
