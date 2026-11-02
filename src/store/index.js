// Root store index
import { authReducer } from './auth/authSlice';
import { mediaReducer } from './media/mediaSlice';

// This would typically use combineReducers if using Redux
export const rootReducer = {
    auth: authReducer,
    media: mediaReducer,
};
