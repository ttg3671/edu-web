import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAppSettings } from '../useAppSettings';
import { FaInfoCircle, FaQuoteRight, FaLayerGroup, FaQuestionCircle } from 'react-icons/fa';
import axios from '../api/axios';

const FeatureCard = ({ icon: Icon, title, description, theme }) => {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className={`relative group p-8 flex flex-col items-center text-center border border-dotted transition-all duration-500 h-80 justify-center overflow-hidden ${
        theme === 'dark' ? 'bg-black/40 border-white/10 hover:border-custom-primary' : 'bg-white border-black/10 hover:border-custom-primary shadow-sm'
      }`}
    >
      <div className="w-16 h-16 rounded-full bg-custom-primary/10 flex items-center justify-center text-custom-primary mb-6 group-hover:scale-110 transition-transform duration-500 flex-shrink-0">
        <Icon size={28} />
      </div>
      
      <div className="space-y-4">
        <h3 className="text-xl font-bold uppercase tracking-tight text-custom-primary group-hover:text-white transition-colors duration-500">
          {title}
        </h3>
        
        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-500 ease-in-out">
          <div className="overflow-hidden">
            <p className={`text-sm leading-relaxed font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 ${theme === 'dark' ? 'text-white/80' : 'text-black/80'}`}>
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* Decorative accent that appears on hover */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-custom-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
    </motion.div>
  );
};

const EdugarciaApp = () => {
  const { theme, t } = useAppSettings();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get('/api/v1/users/plans', { showLoader: false });
        if (response.data.isSuccess) {
          setPlans(response.data.data);
        }
      } catch (error) {
        // Silent error
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  return (
    <div className="bg-custom-bg min-h-screen">
      <div className="relative h-[90vh] w-full overflow-hidden bg-black">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover opacity-60"
        >
          <source src="https://www.edugarciamovimiento.com/public/movimiento_hero.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/30"></div>

        {/* Content Container */}
        <div className="relative h-full w-full flex flex-col items-center justify-end pb-24 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-4xl space-y-8"
          >
            <h1 
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white uppercase tracking-tighter drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
              dangerouslySetInnerHTML={{ __html: t.eduApp.hero.title }}
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="pt-4"
            >
              <Link
                to="/login"
                className="inline-block px-12 py-5 bg-custom-primary text-black font-bold uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_30px_rgba(245,197,66,0.3)] rounded-sm"
              >
                {t.eduApp.hero.cta}
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative Gradient at bottom */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-custom-bg to-transparent pointer-events-none"></div>
      </div>

      {/* Feature Cards Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={FaInfoCircle}
              title={t.eduApp.features.card1.title}
              description={t.eduApp.features.card1.desc}
              theme={theme}
            />
            <FeatureCard
              icon={FaQuoteRight}
              title={t.eduApp.features.card2.title}
              description={t.eduApp.features.card2.desc}
              theme={theme}
            />
            <FeatureCard
              icon={FaLayerGroup}
              title={t.eduApp.features.card3.title}
              description={t.eduApp.features.card3.desc}
              theme={theme}
            />
            <FeatureCard
              icon={FaQuestionCircle}
              title={t.eduApp.features.card4.title}
              description={t.eduApp.features.card4.desc}
              theme={theme}
            />
          </div>
        </div>
      </section>

      {/* Train Anywhere Section */}
      <section className={`py-24 px-6 ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            {/* Left side: CSS Designed Phone Frame with Video */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 flex justify-center relative"
            >
              {/* CSS Phone Frame */}
              <div className="relative w-[280px] md:w-[320px] aspect-[9/19] rounded-[3rem] border-[12px] border-black bg-black shadow-2xl overflow-hidden ring-4 ring-white/10">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-20"></div>
                
                {/* The Video inside the frame */}
                <div className="w-full h-full bg-black z-0">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source src="https://www.edugarciamovimiento.com/public/movimiento_hero.mp4" type="video/mp4" />
                  </video>
                </div>
              </div>
              
              {/* Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-custom-primary/20 blur-[100px] rounded-full -z-0"></div>
            </motion.div>

            {/* Right side: Text Content */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 space-y-8"
            >
              <h2 
                className="text-5xl md:text-7xl font-bold uppercase tracking-tighter leading-none"
                dangerouslySetInnerHTML={{ __html: t.eduApp.trainAnywhere.title }}
              />
              
              <div className="space-y-6">
                <p className={`text-xl md:text-2xl font-medium leading-relaxed ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                  {t.eduApp.trainAnywhere.p1}
                </p>
                <p className={`text-lg leading-relaxed ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>
                  {t.eduApp.trainAnywhere.p2}
                </p>
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="pt-4"
              >
                <Link
                  to="/login"
                  className="inline-block px-10 py-4 bg-custom-primary text-black font-bold uppercase tracking-widest border-2 border-custom-primary hover:bg-black hover:text-custom-primary transition-all rounded-sm"
                >
                  {t.eduApp.trainAnywhere.cta}
                </Link>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-custom-secondary text-center">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-custom-primary uppercase mb-8 sm:mb-16 tracking-tighter"
          >
            {t.pricing.title}
          </motion.h2>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-custom-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {plans.map((plan, idx) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="bg-black/40 border border-white/10 p-10 flex flex-col items-center relative overflow-hidden group"
                >
                  {idx === 1 && (
                    <div className="absolute top-0 right-0 bg-custom-primary text-black text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                      {t.pricing.best_value}
                    </div>
                  )}
                  
                  <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-4">
                    {plan.plan_name}
                  </h3>
                  
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-5xl font-bold text-custom-primary">{plan.monthly_price}</span>
                    <span className="text-2xl font-bold text-custom-primary">€</span>
                    <span className="text-white/40 text-sm uppercase tracking-widest ml-2">
                      / {idx === 0 ? t.pricing.monthly : t.pricing.yearly}
                    </span>
                  </div>

                  <ul className="text-white/60 space-y-4 mb-10 text-left w-full">
                    {t.pricing.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-custom-primary rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full"
                  >
                    <Link
                      to="/login"
                      className="block w-full py-4 bg-custom-primary text-black text-center font-bold uppercase tracking-normal sm:tracking-widest hover:bg-white transition-colors cursor-pointer"
                    >
                      {t.pricing.cta}
                    </Link>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default EdugarciaApp;
