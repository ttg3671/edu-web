import React from 'react';
import { useAppSettings } from '../useAppSettings';
import { motion } from 'framer-motion';
import {
  FaPlay,
  FaExpandArrowsAlt,
  FaDumbbell,
  FaRunning,
  FaEye,
  FaBolt,
  FaBalanceScale,
  FaBaseballBall,
  FaInfinity,
  FaWind,
  FaCheck,
} from 'react-icons/fa';

const skillIcons = [
  FaExpandArrowsAlt,
  FaDumbbell,
  FaRunning,
  FaEye,
  FaBolt,
  FaBalanceScale,
  FaBaseballBall,
  FaInfinity,
  FaWind,
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7 },
};

const Features = () => {
  const { t } = useAppSettings();
  const { video, philosophy, membership, skills } = t.home;

  return (
    <>
      {/* Explainer video */}
      <section id="video" className="py-24 px-6 bg-custom-bg">
        <div className="max-w-5xl mx-auto">
          <motion.div
            {...fadeUp}
            className="relative w-full aspect-video rounded-3xl overflow-hidden border border-[var(--text)]/10 shadow-2xl bg-black"
          >
            <img
              src="/images/edu-beach-900.webp"
              srcSet="/images/edu-beach-480.webp 480w, /images/edu-beach-900.webp 900w"
              sizes="(min-width: 1024px) 1024px, 100vw"
              loading="lazy"
              decoding="async"
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 text-center px-6">
              <div className="w-20 h-20 bg-custom-primary rounded-full flex items-center justify-center text-black shadow-[0_0_40px_rgba(245,197,66,0.45)]">
                <FaPlay size={26} className="ml-1" />
              </div>
              <div>
                <p className="text-white text-lg sm:text-2xl font-bold uppercase tracking-widest">{video.label}</p>
                <p className="text-white/60 text-xs sm:text-sm uppercase tracking-[0.3em] mt-2">{video.soon}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            {...fadeUp}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {video.taglines.map((line) => (
              <div
                key={line}
                className="py-5 px-4 rounded-2xl border border-[var(--text)]/10 bg-[var(--text)]/[0.03] text-center text-sm sm:text-base font-semibold text-custom-text"
              >
                {line}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-24 px-6 bg-[var(--text)]/[0.03]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <motion.div {...fadeUp} className="space-y-6 text-base sm:text-lg leading-relaxed text-[var(--text)]/75">
            <p className="text-2xl sm:text-3xl font-bold leading-snug text-custom-text">
              {philosophy.p1}
            </p>
            <p>{philosophy.p2}</p>
          </motion.div>

          <motion.blockquote
            {...fadeUp}
            className="relative pl-8 border-l-4 border-[var(--primary)]"
          >
            <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase leading-tight tracking-tight text-custom-primary">
              {philosophy.quote}
            </p>
          </motion.blockquote>
        </div>

        <div className="max-w-6xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[philosophy.p3, philosophy.p4, philosophy.p5].map((text, idx) => (
            <motion.div
              key={idx}
              {...fadeUp}
              transition={{ duration: 0.7, delay: idx * 0.1 }}
              className="p-8 rounded-3xl bg-custom-bg border border-[var(--text)]/10 text-[var(--text)]/75 leading-relaxed"
            >
              <span className="block text-4xl font-extrabold text-[var(--primary)]/40 mb-4">0{idx + 1}</span>
              {text}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Membership + skills */}
      <section className="py-24 px-6 bg-custom-bg">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-custom-text mb-4">
              {membership.title}
            </h2>
            <p className="text-lg sm:text-xl text-custom-primary font-medium">{membership.intro}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto mb-24">
            {membership.points.map((point, idx) => (
              <motion.div
                key={idx}
                {...fadeUp}
                transition={{ duration: 0.6, delay: idx * 0.08 }}
                className="flex gap-4 p-6 rounded-2xl border border-[var(--text)]/10 bg-[var(--text)]/[0.03]"
              >
                <span className="shrink-0 mt-0.5 w-7 h-7 rounded-full bg-custom-primary text-black flex items-center justify-center">
                  <FaCheck size={12} />
                </span>
                <p className="text-[var(--text)]/80 leading-relaxed">{point}</p>
              </motion.div>
            ))}
          </div>

          <motion.h3
            {...fadeUp}
            className="text-2xl sm:text-3xl font-bold text-center text-custom-text max-w-3xl mx-auto mb-12"
          >
            {skills.title}
          </motion.h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {skills.items.map((skill, idx) => {
              const Icon = skillIcons[idx % skillIcons.length];
              return (
                <motion.div
                  key={skill.name}
                  {...fadeUp}
                  transition={{ duration: 0.5, delay: (idx % 3) * 0.08 }}
                  whileHover={{ y: -6 }}
                  className="group p-7 rounded-3xl border border-[var(--text)]/10 bg-[var(--text)]/[0.03] hover:border-[var(--primary)]/60 transition-colors"
                >
                  <div className="w-12 h-12 mb-5 rounded-2xl bg-[var(--primary)]/15 text-custom-primary flex items-center justify-center group-hover:bg-custom-primary group-hover:text-black transition-colors">
                    <Icon size={20} />
                  </div>
                  <h4 className="text-lg font-bold uppercase tracking-wide text-custom-text mb-2">{skill.name}</h4>
                  <p className="text-[var(--text)]/65 leading-relaxed">{skill.desc}</p>
                </motion.div>
              );
            })}
          </div>

          <motion.div {...fadeUp} className="text-center mt-16 max-w-4xl mx-auto">
            <p className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-custom-primary mb-8">
              {skills.more}
            </p>
            <p className="text-lg sm:text-xl leading-relaxed text-[var(--text)]/75">{skills.closing}</p>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Features;
