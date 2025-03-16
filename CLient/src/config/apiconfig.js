const BASE_URL = import.meta.env.MODE === 'production' 
  ? 'https://temphost-backend-dml6.onrender.com/api'  // Production URL
  : 'http://localhost:3000/api';                      // Development URL

// Validate BASE_URL format and log for debugging
if (!BASE_URL) {
    throw new Error('VITE_API_URL is not set in environment variables');
}

if (BASE_URL.includes('temphost-client.onrender.com' || 'localhost')) {
    throw new Error('VITE_API_URL is incorrectly set to the client URL instead of the backend API URL');
}

console.log('API Base URL configured as:', BASE_URL);

// Helper function to ensure endpoint starts with '/'
const formatEndpoint = (endpoint) => {
    // Add /api prefix if not present
    const apiPrefix = endpoint.startsWith('/api/') ? '' : '/api';
    const formattedPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${apiPrefix}${formattedPath}`;
};

export const makeRequest = async (endpoint, options = {}) => {
    const formattedEndpoint = formatEndpoint(endpoint);
    const url = `${BASE_URL}${formattedEndpoint}`;
    
    // Log every request for debugging
    console.log('Making API Request:', {
        url,
        method: options.method || 'GET',
        endpoint: formattedEndpoint
    });

    // Validate URL format
    try {
        new URL(url);
    } catch (e) {
        throw new Error(`Invalid URL formed: ${url}`);
    }

    try {
        const response = await fetch(url, {
            ...options,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...options.headers,
            },
        });

        console.log('Response received:', {
            status: response.status,
            ok: response.ok,
            url: response.url
        });

        const text = await response.text();
        console.log('Raw response:', text);

        // Check if response is HTML (indicating an error page)
        if (text.trim().startsWith('<!DOCTYPE html>')) {
            throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}`);
        }

        let data;
        try {
            data = text ? JSON.parse(text) : null;
        } catch (e) {
            console.error('Failed to parse JSON response:', text);
            throw new Error(`Invalid JSON response from server for URL: ${url}. Status: ${response.status}`);
        }

        // Handle authentication errors specifically
        if (response.status === 400 || response.status === 401) {
            if (data && data.message) {
                throw new Error(data.message);
            }
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                message: response.statusText || 'Something went wrong'
            }));
            throw new Error(errorData.message);
        }

        return data;
    } catch (error) {
        console.error('API Request Failed:', {
            url,
            error: error.message,
            endpoint: formattedEndpoint,
            type: error.constructor.name,
            stack: error.stack
        });
        throw error;
    }
};