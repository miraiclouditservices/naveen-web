const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://naveen-backend-s71y.onrender.com/api';

export const fetchApi = async (endpoint: string, options: any = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        let data: any = {};
        try {
            data = await response.json();
        } catch (jsonErr) {
            data = {};
        }

        if (!response.ok) {
            if (response.status === 401 && typeof window !== 'undefined') {
                // Do not force redirect for login or register endpoints
                const isAuthEndpoint = endpoint.includes('/auth/login') || endpoint.includes('/auth/register');
                if (!isAuthEndpoint) {
                    // Clear invalid token and user data
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    // Redirect to login page
                    window.location.href = '/login';
                }
            }
            const error = new Error(data.error || data.message || `Request failed with status ${response.status}`) as any;
            error.status = response.status;
            error.requiresVerification = data.requiresVerification;
            error.email = data.email;
            throw error;
        }

        return data;
    } catch (error: any) {
        // If it's an HTTP error response thrown from above, re-throw it
        if (error.status) {
            throw error;
        }
        // Otherwise, it's a network-level fetch exception (e.g. Failed to fetch)
        console.error(`API Network Failure [${endpoint}]:`, error);
        throw new Error(
            error.message === 'Failed to fetch' || !error.message
                ? 'Server is currently unreachable. Please verify if the backend service is running.'
                : error.message
        );
    }
};

export const api = {
    get: (endpoint: string) => fetchApi(endpoint, { method: 'GET' }),
    post: (endpoint: string, body: any) => fetchApi(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint: string, body: any) => fetchApi(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    patch: (endpoint: string, body: any) => fetchApi(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (endpoint: string) => fetchApi(endpoint, { method: 'DELETE' }),
};
