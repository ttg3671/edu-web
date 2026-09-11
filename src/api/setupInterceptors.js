import axios, { axiosPrivate } from './axios';
import { setGlobalLoading } from '../store/settingsSlice';

let activeRequests = 0;

const showLoader = (dispatch) => {
  if (activeRequests === 0) {
    dispatch(setGlobalLoading(true));
  }
  activeRequests++;
};

const hideLoader = (dispatch) => {
  activeRequests--;
  if (activeRequests <= 0) {
    activeRequests = 0;
    dispatch(setGlobalLoading(false));
  }
};

const setupInterceptors = (store) => {
  const { dispatch } = store;

  const onRequest = (config) => {
    // Optionally skip loader for specific requests
    if (config.showLoader !== false) {
      showLoader(dispatch);
    }
    return config;
  };

  const onResponse = (response) => {
    if (response.config.showLoader !== false) {
      hideLoader(dispatch);
    }
    return response;
  };

  const onError = (error) => {
    if (error.config?.showLoader !== false) {
      hideLoader(dispatch);
    }
    return Promise.reject(error);
  };

  // Default axios
  axios.interceptors.request.use(onRequest, (error) => {
    // If request fails before being sent
    return Promise.reject(error);
  });
  axios.interceptors.response.use(onResponse, onError);

  // Private axios
  axiosPrivate.interceptors.request.use(onRequest, (error) => {
    return Promise.reject(error);
  });
  axiosPrivate.interceptors.response.use(onResponse, onError);
};

export default setupInterceptors;
