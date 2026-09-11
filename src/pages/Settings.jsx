import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSettings } from '../useAppSettings';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../redux/user/user.actions';
import { FaUser, FaTabletAlt, FaTrashAlt, FaSignOutAlt, FaChevronRight, FaExclamationTriangle, FaCreditCard } from 'react-icons/fa';

const Settings = () => {
  const { theme, t, deviceId } = useAppSettings();
  const axiosPrivate = useAxiosPrivate();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = async () => {
    try {
      await axiosPrivate.post('/api/v1/logout', { device_id: deviceId });
    } catch (error) {
      // Silent error
    } finally {
      dispatch(logoutUser());
      navigate('/');
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await axiosPrivate.delete('/api/v1/remove-session/user');
      if (response.data.isSuccess) {
        dispatch(logoutUser());
        navigate('/', { replace: true });
      } else {
        alert(response.data.message || "Failed to delete account.");
      }
    } catch (error) {
      // Silent error
      alert("Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const currentUser = useSelector((state) => state.user.currentUser);

  const settingsLinks = [
    { to: "/profile", icon: FaUser, label: t.settings.profile_link },
    { to: "/subscription-history", icon: FaCreditCard, label: t.profile.subscription_history },
    { to: "/devices", icon: FaTabletAlt, label: t.settings.devices_link },
  ];

  return (
    <div className="min-h-screen bg-custom-bg pt-32 pb-24 px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className={`text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            {t.settings.title}
          </h1>
          <p className={theme === 'dark' ? 'text-white/60' : 'text-black/60'}>{t.settings.subtitle}</p>
        </motion.div>

        <div className="space-y-8">
          {/* Navigation Links Section - Hidden for reviewers */}
          {currentUser?.is_reviewer === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              {settingsLinks.map((link, idx) => (
                <Link
                  key={idx}
                  to={link.to}
                  className={`flex items-center justify-between p-6 border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'} hover:border-custom-primary/50 transition-all rounded-xl group`}
                >
                  <div className="flex items-center gap-4">
                    <link.icon className="text-custom-primary text-xl" />
                    <span className={`font-bold uppercase tracking-widest text-sm ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{link.label}</span>
                  </div>
                  <FaChevronRight className={`${theme === 'dark' ? 'text-white/20' : 'text-black/20'} group-hover:text-custom-primary transition-colors`} />
                </Link>
              ))}
            </motion.div>
          )}

          {/* Account Actions Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="pt-8 space-y-4"
          >
            <h2 className="text-xs font-bold text-custom-primary uppercase tracking-[0.3em] mb-6 px-2">
              {t.settings.account_section}
            </h2>

            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-4 p-6 border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'} hover:bg-black/10 transition-all rounded-xl ${theme === 'dark' ? 'text-white' : 'text-black'} font-bold uppercase tracking-widest text-sm cursor-pointer`}
            >
              <FaSignOutAlt className="text-custom-primary" />
              {t.settings.logout_btn}
            </button>

            <div className="pt-4">
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center gap-4 p-6 border border-red-500/20 bg-red-500/5 hover:bg-red-500 hover:text-white transition-all rounded-xl text-red-500 font-bold uppercase tracking-widest text-sm cursor-pointer"
                >
                  <FaTrashAlt />
                  {t.settings.delete_btn}
                </button>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 border border-red-500/50 bg-red-500/10 rounded-2xl space-y-6"
                >
                  <div className="flex items-center gap-3 text-red-500">
                    <FaExclamationTriangle size={24} />
                    <h3 className="font-bold uppercase tracking-tighter text-xl">Danger Zone</h3>
                  </div>
                  <p className={`${theme === 'dark' ? 'text-white/80' : 'text-black/80'} text-sm leading-relaxed`}>
                    {t.settings.delete_confirm}
                    <br /><br />
                    <span className="text-red-500 font-bold uppercase text-xs">{t.settings.delete_warning}</span>
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="flex-1 py-4 bg-red-500 text-white font-bold uppercase text-xs tracking-[0.2em] hover:bg-red-600 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className={`flex-1 py-4 ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black'} font-bold uppercase text-xs tracking-[0.2em] hover:bg-black/20 transition-all cursor-pointer`}
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
