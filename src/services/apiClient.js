import { API_BASE_URL } from '../utils/constants';

const REQUEST_TIMEOUT_MS = 15000;
const MAX_RETRIES = 1;

class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.inFlight = new Map();
    }

    // Fetch with a timeout so a slow/hung connection never blocks a screen forever
    async fetchWithTimeout(url, options = {}) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        try {
            return await fetch(url, { ...options, signal: controller.signal });
        } finally {
            clearTimeout(timer);
        }
    }

    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const isAbsolute = endpoint.startsWith('http');
        const url = isAbsolute
            ? `${endpoint}${queryString ? (endpoint.includes('?') ? `&${queryString}` : `?${queryString}`) : ''}`
            : `${this.baseUrl}${endpoint}${queryString ? `?${queryString}` : ''}`;

        // Share one request between identical simultaneous calls (e.g. several
        // home rows hitting /v1/movies at the same time)
        if (this.inFlight.has(url)) {
            return this.inFlight.get(url);
        }

        const request = this.getWithRetry(url).finally(() => {
            this.inFlight.delete(url);
        });
        this.inFlight.set(url, request);
        return request;
    }

    async getWithRetry(url) {
        let lastError;
        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                const response = await this.fetchWithTimeout(url);
                if (!response.ok) {
                    const error = new Error(`API Error: ${response.status}`);
                    // Retry only server-side failures, not 4xx
                    error.retryable = response.status >= 500;
                    throw error;
                }
                return await response.json();
            } catch (error) {
                lastError = error;
                const retryable = error.retryable !== false;
                if (!retryable || attempt === MAX_RETRIES) break;
            }
        }
        console.error('Fetch error:', lastError);
        throw lastError;
    }

    async post(endpoint, body = {}) {
        const isAbsolute = endpoint.startsWith('http');
        const url = isAbsolute ? endpoint : `${this.baseUrl}${endpoint}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }
}

export const apiClient = new ApiClient(API_BASE_URL);
