import React from 'react';
import { motion } from 'framer-motion';
import { useAppSettings } from '../useAppSettings';
import { FaEnvelope, FaInstagram, FaFacebookF, FaTiktok, FaYoutube } from 'react-icons/fa';

const ContactUs = () => {
  const { t, theme } = useAppSettings();

  const socialLinks = [
    { Icon: FaInstagram, href: "https://www.instagram.com/edugarcia_trainer/" },
    { Icon: FaFacebookF, href: "https://www.facebook.com/people/Edu-Garcia/61555837111324/#" },
    { Icon: FaTiktok, href: "https://www.tiktok.com/@edugarcia_trainer" },
    { Icon: FaYoutube, href: "https://www.youtube.com/@edugarcia_trainer/featured" },
  ];

  return (
    <div className="min-h-screen bg-custom-bg pt-32 pb-24 px-6 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-custom-primary uppercase tracking-tighter mb-4 leading-tight">
            {t.contact.title}
          </h1>
          <p className={`text-xl md:text-2xl max-w-2xl mx-auto ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>
            {t.contact.subtitle}
          </p>
          <div className="h-1 w-24 bg-custom-primary mx-auto mt-8"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-custom-primary uppercase tracking-tight flex items-center gap-3">
                <FaEnvelope /> {t.contact.email_label}
              </h2>
              <a 
                href={`mailto:${t.contact.email}`}
                className={`text-lg md:text-xl font-bold transition-colors hover:text-custom-primary ${theme === 'dark' ? 'text-white' : 'text-black'}`}
              >
                {t.contact.email}
              </a>
            </div>

            <p className={`text-lg leading-relaxed ${theme === 'dark' ? 'text-white/70' : 'text-black/70'}`}>
              {t.contact.cta_text}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className={`p-10 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'} backdrop-blur-sm text-center`}
          >
            <h3 className="text-xl font-bold text-custom-primary uppercase tracking-widest mb-8">
              {t.contact.follow_us}
            </h3>
            <div className="flex justify-center gap-6">
              {socialLinks.map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, color: '#f5c542' }}
                  className={`text-3xl transition-colors ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                >
                  <social.Icon />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-24 text-center"
        >
          <p className="text-lg italic text-custom-primary">
            "Movement is the universal language of the human soul."
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactUs;
