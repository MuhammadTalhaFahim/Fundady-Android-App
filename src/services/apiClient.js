import { API_BASE_URL } from '../utils/constants';

class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const isAbsolute = endpoint.startsWith('http');
        const url = isAbsolute
            ? `${endpoint}${queryString ? (endpoint.includes('?') ? `&${queryString}` : `?${queryString}`) : ''}`
            : `${this.baseUrl}${endpoint}${queryString ? `?${queryString}` : ''}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }

<<<<<<< HEAD
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
=======
    // Add post, put, delete methods as needed
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
}

export const apiClient = new ApiClient(API_BASE_URL);