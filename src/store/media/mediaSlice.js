export const movieInitialState = {
    movies: [],
    gallery: [],
    webSeries: [],
    categories: [],
    loading: false,
};

export const mediaReducer = (state = movieInitialState, action) => {
    switch (action.type) {
        case 'SET_MOVIES':
            return { ...state, movies: action.payload };
        case 'SET_GALLERY':
            return { ...state, gallery: action.payload };
        case 'SET_WEB_SERIES':
            return { ...state, webSeries: action.payload };
        case 'SET_CATEGORIES':
            return { ...state, categories: action.payload };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        default:
            return state;
    }
};
