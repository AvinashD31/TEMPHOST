const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL || API_URL === window.location.origin) {
  throw new Error('VITE_API_URL is incorrectly set to the client URL instead of the backend API URL');
}

console.log('API Base URL configured as:', API_URL);

// Helper function to ensure endpoint starts with '/'
const formatEndpoint = (endpoint) => {
    // Remove the /api prefix if present since BASE_URL already includes it
    endpoint = endpoint.replace(/^\/api\//, '/');
    // Ensure endpoint starts with /
    return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
};

export const makeRequest = async (endpoint, options = {}) => {
  try {
    const formattedEndpoint = formatEndpoint(endpoint);
    const url = `${API_URL}${formattedEndpoint}`;
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

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Something went wrong');
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};