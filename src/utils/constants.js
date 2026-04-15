export const API_BASE_URL = 'https://entertainment-demo.squadcloud.co/api';
export const MOVIES_API_URL = `${API_BASE_URL}/v1/movies`;
export const GALLERY_API_URL = `${API_BASE_URL}/v1/gallery`;
export const CATEGORIES_API_URL = `${API_BASE_URL}/v1/categories`;
export const WEB_SERIES_API_URL = `${API_BASE_URL}/tvshows/web_series`;

export const MOVIES_POSTER_BASE_URL = 'https://entertainment-demo.squadcloud.co/MoviesPoster/';
export const GALLERY_POSTER_BASE_URL = 'https://entertainment-demo.squadcloud.co/FrontGallery/';
export const TV_SHOWS_POSTER_BASE_URL = 'https://entertainment-demo.squadcloud.co/TvShowPoster/';

export const IMAGE_BASE_URL = MOVIES_POSTER_BASE_URL; // Default fallback

export const CATEGORIES = {
    TRENDING: 'Trending Now',
    POPULAR: 'Popular on Netflix',
    NEW_RELEASES: 'New Releases',
    MY_LIST: 'My List',
    ACTION: 'Action Movies',
    COMEDY: 'Comedy Movies',
};

export const SCREEN_NAMES = {
    HOME: 'Home',
    CINEMA: 'Cinema',
    SERIES: 'Series',
    TV_ON: 'TvOn',
    DETAILS: 'Details',
};
