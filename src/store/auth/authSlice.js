// Basic Redux Slice placeholder in JS
export const authInitialState = {
    user: null,
    token: null,
    loading: false,
};

export const authReducer = (state = authInitialState, action) => {
    switch (action.type) {
        case 'SET_USER':
            return { ...state, user: action.payload };
        default:
            return state;
    }
};
