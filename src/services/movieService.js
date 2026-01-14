import { apiClient } from './apiClient';

export const movieService = {
    getTrendingMovies: async () => {
        return await apiClient.get('/trending/movie/day');
    },
    getPopularMovies: async () => {
        return await apiClient.get('/movie/popular');
    },
    getMovieDetails: async (movieId) => {
        return await apiClient.get(`/movie/${movieId}`);
    },
};
