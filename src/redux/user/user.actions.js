import { SET_CURRENT_USER, USER_LOGOUT, SET_RESET_TOKEN, SET_TOKEN, SET_DEVICE } from './user.types';

export const setCurrentUser = (user) => ({
	type: SET_CURRENT_USER,
	payload: user
});

export const setToken = (accessToken) => ({
	type: SET_TOKEN,
	payload: accessToken
});

export const logoutUser = () => ({
  type: USER_LOGOUT
});

export const setResetToken = (token) => ({
  type: SET_RESET_TOKEN,
  payload: token,
});

export const setDevice = (device) => ({
  type: SET_DEVICE,
  payload: device,
});