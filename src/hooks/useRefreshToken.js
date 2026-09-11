import axios from '../api/axios';
import { useDispatch } from 'react-redux';
import { setToken } from '../redux/user/user.actions';

const useRefreshToken = () => {
    const dispatch = useDispatch();

    const refresh = async () => {
        try {
            const response = await axios.get('/api/v1/refresh/', {
                withCredentials: true,
                showLoader: false
            });

            if (response.data && response.data.isSuccess) {
                const accessToken = response.data.token;
                dispatch(setToken(accessToken));
                return accessToken;
            }

            return null;
        } catch (error) {
            return null;
        }
    }
    return refresh;
};

export default useRefreshToken;