import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSettings } from '../useAppSettings';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { useSelector } from 'react-redux';
import { FaTrash, FaDesktop, FaMobileAlt, FaLaptop, FaQuestionCircle, FaExclamationTriangle } from 'react-icons/fa';

const ConnectedDevices = () => {
  const { theme, t } = useAppSettings();
  const axiosPrivate = useAxiosPrivate();
  const currentUser = useSelector((state) => state.user.currentUser);

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null); // stores device identifier to confirm removal
  const [deviceLimit, setDeviceLimit] = useState(currentUser?.subscription_details?.max_devices || 1);

  // Fetch devices
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const storedDeviceId = localStorage.getItem('device_id');

        const response = await axiosPrivate.post(
          '/api/v1/devices/connected-device', 
          { "device_id": storedDeviceId }
        );

        if (response.data?.isSuccess) {
          const apiDevices = response.data?.data?.result || [];
          setDevices(apiDevices);

          if (response.data?.data?.deviceLimit) {
            setDeviceLimit(response.data.data.deviceLimit);
          }
        }
      } catch (error) {
        // Silent error
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [axiosPrivate]);

  const handleRemoveDevice = async (deviceId) => {
    setRemovingId(deviceId);
    try {
      const storedDeviceId = localStorage.getItem('device_id');

      const response = await axiosPrivate.post('/api/v1/devices/remove-device', {
        current_device_id: storedDeviceId,
        device_id: deviceId
      });

      if (response.data?.isSuccess && (response.data.data?.isRemoved || response.data?.isSuccess)) {
        setDevices((prev) => prev.filter((d) => (d.device_fingerprint || d.device_id) !== deviceId));
        setShowConfirm(null);
      } else {
        alert(response.data?.data?.message || response.data?.message || t.devices.remove_error);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to remove device.");
    } finally {
      setRemovingId(null);
    }
  };

  const getDeviceIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'web': return <FaLaptop className="text-custom-primary" />;
      case 'mobile': return <FaMobileAlt className="text-custom-primary" />;
      default: return <FaDesktop className="text-custom-primary" />;
    }
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
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className={`text-4xl md:text-6xl font-bold uppercase tracking-tighter mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            {t.devices.title}
          </h1>
          <p className={`${theme === 'dark' ? 'text-white/60' : 'text-black/60'} text-lg`}>{t.devices.subtitle}</p>
          <div className="mt-4 inline-block px-4 py-1 bg-custom-primary/10 border border-custom-primary/20 rounded-full text-custom-primary text-xs font-bold uppercase tracking-widest">
            {t.devices.limit}: {devices.length} / {deviceLimit}
          </div>
        </motion.div>

        <div className="space-y-4">
          <AnimatePresence>
            {devices.map((device, idx) => {
              const isCurrent = Boolean(device.is_connected);
              const deviceIdentifier = device.device_fingerprint || device.device_id || idx;

              return (
                <motion.div
                  key={deviceIdentifier}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-6 flex items-center justify-between border ${
                    isCurrent 
                      ? 'bg-green-500/5 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                      : theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'
                  } rounded-xl group`}
                >
                  <div className="flex items-center gap-6">
                    <div className="text-3xl">
                      {getDeviceIcon(device.device_type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className={`font-bold uppercase tracking-wide ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                          {device.device_type || 'Unknown Device'}
                        </h3>
                        {isCurrent && (
                          <span className="text-[10px] bg-custom-primary text-black px-2 py-0.5 font-bold uppercase tracking-tighter rounded">
                            {t.devices.current}
                          </span>
                        )}
                      </div>
                      <p className={`${theme === 'dark' ? 'text-white/30' : 'text-black/30'} text-[10px] uppercase tracking-widest mt-2`}>
                        {t.devices.last_seen}: {device.seen_at}
                      </p>
                    </div>
                  </div>

                  {!isCurrent && (
                    <div className="relative">
                      {showConfirm === deviceIdentifier ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRemoveDevice(deviceIdentifier)}
                            disabled={removingId === deviceIdentifier}
                            className="px-4 py-2 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all rounded cursor-pointer disabled:opacity-50"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setShowConfirm(null)}
                            className={`px-4 py-2 ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black'} text-[10px] font-bold uppercase tracking-widest hover:bg-black/20 transition-all rounded cursor-pointer`}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowConfirm(deviceIdentifier)}
                          className={`p-3 ${theme === 'dark' ? 'text-white/20' : 'text-black/20'} hover:text-red-500 hover:bg-red-500/10 transition-all rounded-lg cursor-pointer`}
                          title={t.devices.remove_btn}
                        >
                          <FaTrash size={18} />
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 p-6 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-start gap-4"
        >
          <FaExclamationTriangle className="text-red-500 shrink-0 mt-1" />
          <p className={`${theme === 'dark' ? 'text-white/60' : 'text-black/60'} text-sm italic`}>
            Removing a device will immediately revoke its access to your premium content. You can always log back in from that device as long as you haven't reached your device limit.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ConnectedDevices;
