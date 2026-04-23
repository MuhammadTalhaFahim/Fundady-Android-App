import { apiClient } from './apiClient';

export const movieService = {
    getMovies: async () => {
        return await apiClient.get('/v1/movies');
    },
    getGallery: async () => {
        return await apiClient.get('/v1/gallery');
    },
    getCategories: async () => {
        return await apiClient.get('/v1/categories');
    },
    getWebSeries: async () => {
        return await apiClient.get('/tvshows/web_series');
    },
    getTVSerials: async () => {
        return await apiClient.get('/tvshows/tv_serials');
    },
    getTVShows: async () => {
        return await apiClient.get('/tvshows/tv_shows?genre=reality');
    },
    search: async (query) => {
        return await apiClient.get('https://fundady.com/api/v1/search', { title: query });
    },
    getSportsCategories: async () => {
        return await apiClient.get('https://fundady.com/api/v1/categories');
    },
    getYears: async () => {
        return await apiClient.get('/v1/years');
    },
    getGenres: async () => {
        return await apiClient.get('/v1/genres');
    },
    getSeriesCategories: async () => {
        return await apiClient.get('/v1/series_categories');
    },
    getWWE: async () => {
        return await apiClient.get('/sports/wwe');
    },
    getCricket: async () => {
        return await apiClient.get('/sports/cricket');
    },
    getFootball: async () => {
        return await apiClient.get('/sports/football');
    },
    getTVChannels: async () => {
        return await apiClient.get('/tvon/channel-list');
    },
    getTVCategories: async (name) => {
        let url = '/tvon/channel-category';
        if (name) url += `?name=${name}`;
        return await apiClient.get(url);
    },
    searchTVChannels: async (name, categoryId) => {
        let url = `/tvon/channel-list?status=1`;
        if (name) url += `&name=${name}`;
        if (categoryId) url += `&category_id=${categoryId}`;
        return await apiClient.get(url);
    },
    getMovieById: async (id) => {
        return await apiClient.get(`/v1/single-movie/${id}`);
    },
    getWebSeriesById: async (id) => {
        return await apiClient.get(`/single-show/${id}`);
    },
    getTVShowById: async (id) => {
        return await apiClient.get(`/single-show/${id}`);
    },
    getTVSerialById: async (id) => {
        return await apiClient.get(`/single-show/${id}`);
    },
    getSeriesById: async (id) => {
        return await apiClient.get(`/single-show/${id}`);
    },
    getWWEById: async (id) => {
        return await apiClient.get('/sports/wwe', { id });
    },
    getCricketById: async (id) => {
        return await apiClient.get('/sports/cricket', { id });
    },
    getFootballById: async (id) => {
        return await apiClient.get('/sports/football', { id });
    }
};