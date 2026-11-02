import { apiClient } from './apiClient';

export const seriesService = {
    getPopularSeries: async () => {
        return await apiClient.get('/tv/popular');
    },
    getSeriesDetails: async (seriesId) => {
        return await apiClient.get(`/tv/${seriesId}`);
    },
};
