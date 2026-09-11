export const DEVICE_ID_REGEX = /^[A-Za-z0-9-:_]+$/;

/**
 * Generate a random device ID containing characters matching /^[A-Za-z0-9-:_]+$/
 * (A-Z, a-z, 0-9)
 */
export const generateDeviceId = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
      result += chars[randomValues[i] % chars.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }

  return result;
};

/**
 * Get the stored device ID, or generate and store one if not present
 * or if the previously stored value does not match /^[A-Za-z0-9-:_]+$/.
 */
export const getDeviceId = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    let deviceId = localStorage.getItem('device_id');

    // If no device ID exists or the stored one doesn't match the regex, generate and store a new one
    if (!deviceId || !DEVICE_ID_REGEX.test(deviceId)) {
      deviceId = generateDeviceId();
      localStorage.setItem('device_id', deviceId);
    }

    return deviceId;
  }

  return generateDeviceId();
};

export default getDeviceId;