import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAppSettings } from '../useAppSettings';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentUser } from '../redux/user/user.actions';
import { FaUser, FaCreditCard, FaTabletAlt, FaSave, FaBan } from 'react-icons/fa';

const Profile = () => {
  const { theme, t, deviceId } = useAppSettings();
  const axiosPrivate = useAxiosPrivate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.currentUser);
  // console.log(currentUser);
  
  const [profile, setProfile] = useState({ 
    profile_name: '',
    profile_bio: ''
  });
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Sync profile state when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfile({
        profile_name: currentUser.profile_name || currentUser.name || '',
        profile_bio: currentUser.profile_bio || currentUser.bio || ''
      });
    }
  }, [currentUser?.profile_name, currentUser?.profile_bio]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [profileRes, subRes] = await Promise.all([
          axiosPrivate.get(`/api/v1/profile/details?device_id=${deviceId}`),
          axiosPrivate.get('/api/v1/payments/subscriptions')
        ]);

        if (profileRes.data.isSuccess) {
          const userData = profileRes.data.data;
          const normalizedData = {
            profile_name: userData.profile_name || userData.name || '',
            profile_bio: userData.profile_bio || userData.bio || ''
          };
          setProfile(normalizedData);
          // Update Redux if backend has fresher info
          dispatch(setCurrentUser({ ...currentUser, ...userData, ...normalizedData }));
        }
        
        if (subRes.data.isSuccess && subRes.data.data && Array.isArray(subRes.data.data)) {
          const activeSub = subRes.data.data.find(sub => sub.status === 'active' || sub.is_active === 1);
          if (activeSub) {
            setSubscription({
              ...activeSub,
              subscription_id: activeSub.subscription_id || activeSub.id,
              stripe_sub_id: activeSub.stripe_sub_id || activeSub.subscription_id || activeSub.id,
              is_active: (activeSub.status === 'active' || activeSub.is_active === 1) ? 1 : 0,
              price: activeSub.monthly_price || activeSub.price
            });
          } else {
            setSubscription(null);
          }
        }
      } catch (error) {
        // Silent error
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.email) {
      fetchProfileData();
    }
  }, [axiosPrivate, deviceId, dispatch, currentUser?.email]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axiosPrivate.put('/api/v1/profile/details', {
        device_id: deviceId,
        name: profile.profile_name,
        bio: profile.profile_bio,
        avatar_url: "" // Sent as empty string as requested
      });

      if (response.data.isSuccess) {
        setMessage({ type: 'success', text: response.data.data.message });
        // Update local state and Redux with new values
        dispatch(setCurrentUser({ ...currentUser, ...profile }));
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelling(true);
    try {
      const response = await axiosPrivate.post('/api/v1/payments/subscription-cancel', {
        subs_id: subscription.stripe_sub_id
      });
      if (response.data.isSuccess) {
        setSubscription(prev => ({ ...prev, is_active: 0, status: 'cancelled' }));
        
        // Update Redux state to reflect no active subscription
        dispatch(setCurrentUser({ 
          ...currentUser, 
          is_subscribed: 0, 
          subscription_details: null 
        }));

        setShowCancelConfirm(false);
        setMessage({ type: 'success', text: response.data.data.message || 'Subscription cancelled successfully.' });
        
        // Redirect to app after a short delay to allow the user to see the success message
        setTimeout(() => {
          handleReturn();
        }, 2000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to cancel subscription.' });
    } finally {
      setCancelling(false);
    }
  };

  const handleReturn = () => {
    // This will force the mobile OS to wake up your Flutter app
    window.location.href = "edugarciamovimiento://callback?screen=subscription_status";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-custom-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-custom-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-custom-bg pt-32 pb-24 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column: Profile Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-8"
        >
          <div className="flex items-center gap-4 mb-8">
            <FaUser className="text-custom-primary text-3xl" />
            <h1 className={`text-4xl font-bold uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{t.profile.title}</h1>
          </div>

          {message.text && (
            <div className={`p-4 text-sm font-bold uppercase tracking-widest border ${
              message.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-red-500/10 border-red-500/50 text-red-500'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-xs font-bold text-custom-primary uppercase tracking-widest mb-2">{t.profile.name}</label>
                <input
                  type="text"
                  value={profile.profile_name || ''}
                  onChange={(e) => setProfile({ ...profile, profile_name: e.target.value })}
                  className={`w-full px-4 py-3 ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'} focus:border-custom-primary outline-none transition-all`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-custom-primary uppercase tracking-widest mb-2">{t.profile.bio}</label>
              <textarea
                rows="4"
                value={profile.profile_bio || ''}
                onChange={(e) => setProfile({ ...profile, profile_bio: e.target.value })}
                className={`w-full px-4 py-3 ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'} focus:border-custom-primary outline-none transition-all resize-none`}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={updating}
              className="px-8 py-4 bg-custom-primary text-black font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-black hover:text-white transition-all disabled:opacity-50"
            >
              <FaSave /> {updating ? 'Updating...' : t.profile.update_btn}
            </motion.button>
          </form>
        </motion.div>

        {/* Right Column: Subscription & Devices */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          {/* Subscription Card */}
          <div className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'} border p-8 rounded-2xl`}>
            <div className="flex items-center gap-3 mb-6">
              <FaCreditCard className="text-custom-primary text-xl" />
              <h2 className={`text-xl font-bold uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{t.profile.subscription}</h2>
            </div>

            {subscription && subscription.is_active === 1 ? (
              <div className="space-y-6">
                <div className="p-5 bg-custom-primary/10 border border-custom-primary/20 rounded-xl w-full">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-custom-primary font-bold uppercase tracking-widest text-xs mb-1">{subscription.plan_name}</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${
                          subscription.status === 'active' ? 'bg-green-500/20 text-green-500' : theme === 'dark' ? 'bg-white/10 text-white/40' : 'bg-black/10 text-black/40'
                        }`}>
                          {subscription.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-2xl font-bold mt-2`}>
                    {subscription.price}€
                    <span className={`${theme === 'dark' ? 'text-white/40' : 'text-black/40'} text-sm font-normal ml-1`}>
                      {subscription.duration_value === 1 
                        ? ` / ${subscription.duration_unit === 'month' ? t.pricing.monthly.toLowerCase() : subscription.duration_unit === 'year' ? t.pricing.yearly.toLowerCase() : subscription.duration_unit}`
                        : ` / ${subscription.duration_value} ${subscription.duration_unit}`}
                    </span>
                  </p>
                  
                  {subscription.status === 'active' && !showCancelConfirm && (
                    <button 
                      onClick={() => setShowCancelConfirm(true)}
                      className={`mt-4 w-full text-red-500 ${theme === 'dark' ? 'hover:text-white hover:bg-red-500' : 'hover:text-black hover:bg-red-500'} transition-all font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 border border-red-500/30 px-4 py-2 rounded-lg`}
                    >
                      <FaBan size={10} /> {t.profile.cancel_btn}
                    </button>
                  )}
                </div>
                
                {showCancelConfirm && (
                  <div className="space-y-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className={`text-xs ${theme === 'dark' ? 'text-white/80' : 'text-black/80'} font-bold uppercase text-center`}>{t.profile.cancel_confirm}</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={handleCancelSubscription}
                        disabled={cancelling}
                        className="flex-1 py-2 bg-red-500 text-white font-bold uppercase text-[10px] tracking-widest hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center"
                      >
                        {cancelling ? (
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : 'Yes, Cancel'}
                      </button>
                      <button 
                        onClick={() => setShowCancelConfirm(false)}
                        disabled={cancelling}
                        className={`flex-1 py-2 ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black'} font-bold uppercase text-[10px] tracking-widest hover:bg-black/20 transition-all disabled:opacity-50`}
                      >
                        No, Keep it
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className={`${theme === 'dark' ? 'text-white/40' : 'text-black/40'} text-sm mb-6`}>{t.profile.no_subscription}</p>
                <Link to="/pricing" className={`text-custom-primary font-bold uppercase text-sm tracking-widest ${theme === 'dark' ? 'hover:text-white' : 'hover:text-black'} transition-colors`}>
                  View Plans
                </Link>
              </div>
            )}
          </div>

          {/* Subscription History Card */}
          <div className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'} border p-8 rounded-2xl`}>
            <div className="flex items-center gap-3 mb-6">
              <FaCreditCard className="text-custom-primary text-xl" />
              <h2 className={`text-xl font-bold uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{t.profile.subscription_history}</h2>
            </div>
            <p className={`${theme === 'dark' ? 'text-white/40' : 'text-black/40'} text-sm mb-6`}>View your previous subscriptions and payment records.</p>
            <Link 
              to="/subscription-history" 
              className={`w-full py-3 ${theme === 'dark' ? 'bg-white/10 text-white hover:bg-white hover:text-black' : 'bg-black/10 text-black hover:bg-black hover:text-white'} transition-all font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 rounded-lg`}
            >
              {t.profile.history_link}
            </Link>
          </div>

          {/* Devices Card */}
          <div className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'} border p-8 rounded-2xl`}>
            <div className="flex items-center gap-3 mb-6">
              <FaTabletAlt className="text-custom-primary text-xl" />
              <h2 className={`text-xl font-bold uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{t.profile.connected_devices}</h2>
            </div>
            <p className={`${theme === 'dark' ? 'text-white/40' : 'text-black/40'} text-sm mb-6`}>Manage the devices logged into your account.</p>
            <Link 
              to="/devices" 
              className={`w-full py-3 ${theme === 'dark' ? 'bg-white/10 text-white hover:bg-white hover:text-black' : 'bg-black/10 text-black hover:bg-black hover:text-white'} transition-all font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 rounded-lg`}
            >
              {t.profile.devices_link}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
