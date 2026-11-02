import { apiClient } from './apiClient';

const AD_SLOTS = ['ad 1', 'ad 2', 'ad 3', 'ad 4'];

// Returns { 'ad 1': [...], 'ad 2': [...], ... } with only active ads that have an image.
// Backend controls activation — inactive ads are either omitted or sent with status !== 1.
const normalizeAds = json => {
    const data = json?.status && json?.data ? json.data : {};
    return AD_SLOTS.reduce((acc, slot) => {
        const list = Array.isArray(data[slot]) ? data[slot] : [];
        acc[slot] = list.filter(ad => ad?.image && Number(ad.status) === 1);
        return acc;
    }, {});
};

export const adService = {
    getAds: async () => {
        const json = await apiClient.get('/v1/ads');
        return normalizeAds(json);
    },
};
