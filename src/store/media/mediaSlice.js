export const movieInitialState = {
    trending: [],
    popular: [],
    loading: false,
};

export const mediaReducer = (state = movieInitialState, action) => {
    switch (action.type) {
        case 'SET_TRENDING':
            return { ...state, trending: action.payload };
        default:
            return state;
    }
};
