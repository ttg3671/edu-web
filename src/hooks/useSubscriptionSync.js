 import { useState, useEffect, useCallback } from 'react';
import useAxiosPrivate from './useAxiosPrivate';
import { useDispatch } from 'react-redux';
import { setCurrentUser, setToken } from '../redux/user/user.actions';

export const useSubscriptionSync = (sessionId) => {
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [data, setData] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const axiosPrivate = useAxiosPrivate();
  const dispatch = useDispatch();

  const MAX_RETRIES = 5; // Total 10-15 seconds of checking

  const checkStatus = useCallback(async () => {
    try {
      const response = await axiosPrivate.post(`/api/v1/payments/subscriptions-status?session_id=${sessionId}`);
      // console.log('Payment Success Response:', response.data);
      // console.log('Payment Success Headers:', response.headers);
      
      const result = response.data.data;

      // Check for user data or tokens in response to handle auto-login/sync
      if (result?.user) {
        dispatch(setCurrentUser(result.user));
      }
      if (result?.accessToken) {
        dispatch(setToken(result.accessToken));
      }

      // If status is 'processing', the worker hasn't finished. Keep polling.
      if (result.status === 'processing') {
        if (retryCount < MAX_RETRIES) {
          setTimeout(() => setRetryCount(prev => prev + 1), 2500); // Wait 2.5s
        } else {
          setStatus('error');
        }
      } else if (result.isActive || result.status === 'succeeded' || result.status === 'active') {
        setData(result);
        setStatus('success');
      }
    } catch (err) {
      console.error('Subscription Sync Error:', err);
      // If 404, the DB record isn't there yet. Keep polling.
      if (err.response?.status === 404 && retryCount < MAX_RETRIES) {
        setTimeout(() => setRetryCount(prev => prev + 1), 2500);
      } else {
        setStatus('error');
      }
    }
  }, [sessionId, retryCount, dispatch]);

  useEffect(() => {
    if (sessionId) checkStatus();
  }, [sessionId, checkStatus]);

  return { status, data };
};
