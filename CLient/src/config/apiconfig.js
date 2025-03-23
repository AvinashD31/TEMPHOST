const API_URL = import.meta.env.VITE_API_URL?.trim() || '';

// Validate API URL
if (!API_URL) {
  console.error('VITE_API_URL is not set in environment variables');
}

// Ensure API_URL doesn't end with /api and we add it consistently in the code
const BASE_URL = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;

console.log('API Base URL configured as:', BASE_URL);

// Helper function to ensure endpoint starts with '/'
const formatEndpoint = (endpoint) => {
    // Remove the /api prefix if present since BASE_URL already includes it
    endpoint = endpoint.replace(/^\/api\//, '/');
    // Ensure endpoint starts with /
    return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
};

export const makeRequest = async (endpoint, options = {}) => {
  try {
    // Ensure endpoint starts with '/'
    const sanitizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${BASE_URL}${sanitizedEndpoint}`;

    if (import.meta.env.DEV) {
      console.log('Making request to:', url);
    }

    const token = sessionStorage.getItem('authToken');

    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    // Log the response details in development
    if (import.meta.env.DEV) {
      console.log('API Request:', {
        url,
        method: options.method || 'GET',
        status: response.status,
        statusText: response.statusText,
      });
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', {
      error: error.message,
      endpoint,
      baseUrl: BASE_URL,
    });
    throw error;
  }
};