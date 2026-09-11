import React from 'react';
import { motion } from 'framer-motion';
import { useAppSettings } from '../useAppSettings';

const Testimonials = () => {
  const { theme, t } = useAppSettings();

  return (
    <section className="py-24 px-6 bg-custom-bg">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-custom-primary uppercase tracking-tighter mb-4">
            {t.eduApp.testimonials.title}
          </h2>
          <p className={`text-lg uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>
            {t.eduApp.testimonials.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            "NhA9X2JD9aE",
            "z79RvlVNE2E",
            "ktWgOvA9CW4",
          ].map((id, idx) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative aspect-[9/16] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black"
            >
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${id}?origin=${encodeURIComponent(
                  window.location.origin
                )}`}
                title={`Student Testimonial ${idx + 1}`}
                frameBorder="0"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </motion.div>
          ))}
        </div>

        {/*<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            "NhA9X2JD9aE",
            "z79RvlVNE2E",
            "ktWgOvA9CW4"
          ].map((id, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative aspect-[9/16] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black"
            >
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${id}`}
                title={`Student Testimonial ${idx + 1}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </motion.div>
          ))}
        </div>*/}
      </div>
    </section>
  );
};

export default Testimonials;
