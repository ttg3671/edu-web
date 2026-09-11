import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppSettings } from '../useAppSettings';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { useSelector } from 'react-redux';
import { FaCreditCard, FaHistory, FaChevronLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const SubscriptionHistory = () => {
  const { theme, t } = useAppSettings();
  const axiosPrivate = useAxiosPrivate();
  const currentUser = useSelector((state) => state.user.currentUser);

  const [subHistory, setSubHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axiosPrivate.get('/api/v1/payments/subscriptions');
        
        if (response.data.isSuccess && response.data.data && Array.isArray(response.data.data)) {
          setSubHistory(response.data.data);
        }
      } catch (error) {
        // Silent error
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.email) {
      fetchHistory();
    }
  }, [axiosPrivate, currentUser?.email]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-custom-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-custom-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-custom-bg pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <Link 
          to="/profile" 
          className={`inline-flex items-center gap-2 mb-8 text-sm font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-white/60 hover:text-custom-primary' : 'text-black/60 hover:text-custom-primary'} transition-colors`}
        >
          <FaChevronLeft /> {t.profile.title}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-custom-primary/10 rounded-full">
              <FaHistory className="text-custom-primary text-4xl" />
            </div>
          </div>
          <h1 className={`text-4xl md:text-6xl font-bold uppercase tracking-tighter mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            {t.profile.subscription_history}
          </h1>
          <p className={`${theme === 'dark' ? 'text-white/60' : 'text-black/60'} text-lg`}>
            A complete record of your subscription payments and plans.
          </p>
        </motion.div>

        <div className="space-y-4">
          {subHistory.length > 0 ? (
            subHistory.map((sub, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-6 border ${theme === 'dark' ? 'border-white/5 bg-white/5' : 'border-black/5 bg-black/5'} rounded-2xl flex justify-between items-center`}
              >
                <div className="flex items-center gap-6">
                  <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`}>
                    <FaCreditCard className="text-custom-primary text-xl" />
                  </div>
                  <div>
                    <p className={`font-bold uppercase tracking-widest text-sm ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                      {sub.plan_name}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-black/40'} mt-1`}>
                      {sub.monthly_price || sub.price}€ {sub.duration_value === 1 ? `/ ${sub.duration_unit}` : `/ ${sub.duration_value} ${sub.duration_unit}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-tighter ${
                    sub.status === 'active' || sub.is_active === 1 
                      ? 'bg-green-500/20 text-green-500' 
                      : 'bg-red-500/20 text-red-500'
                  }`}>
                    {sub.status}
                  </span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className={`${theme === 'dark' ? 'text-white/40' : 'text-black/40'} text-lg italic`}>
                No subscription history found.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionHistory;
