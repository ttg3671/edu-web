import { SET_CURRENT_USER, USER_LOGOUT, SET_RESET_TOKEN, SET_TOKEN, SET_DEVICE } from './user.types';

const INITIAL_STATE = {
	currentUser: null,
	accessToken: null,
	resetToken: null,
	device: null,
}

const userReducer = (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case SET_CURRENT_USER:
			return {
				...state,
				currentUser: action.payload,
			};

		case SET_TOKEN:
			return {
				...state,
				accessToken: action.payload,
			};

		case SET_DEVICE:
			return {
				...state,
				device: action.payload,
			};

		case USER_LOGOUT:
			return {
				...state,
				currentUser: null,
				accessToken: null,
				resetToken: null,
				device: null,
			};

		case SET_RESET_TOKEN:
			return {
				...state,
				resetToken: action.payload,
			};

		default:
			return state;
	}
};

export default userReducer;