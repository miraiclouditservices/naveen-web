const DEFAULT_REMOTE = 'https://naveen-backend-s71y.onrender.com/api';
const DEFAULT_LOCAL = 'http://localhost:5001/api';
const API_URL = process.env.NEXT_PUBLIC_API_URL || DEFAULT_LOCAL;

const inflightGetRequests = new Map<string, Promise<any>>();

export const getStoredToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
        const token = localStorage.getItem('token');
        if (!token || token === 'undefined' || token === 'null') {
            if (token === 'undefined' || token === 'null') {
                localStorage.removeItem('token');
            }
            return null;
        }
        return token;
    } catch {
        return null;
    }
};

export const setStoredToken = (token: string | null | undefined): void => {
    if (typeof window === 'undefined') return;
    if (token && token !== 'undefined' && token !== 'null') {
        localStorage.setItem('token', token);
    } else {
        localStorage.removeItem('token');
    }
};

export const getStoredUser = (): any | null => {
    if (typeof window === 'undefined') return null;
    try {
        const stored = localStorage.getItem('user');
        if (!stored || stored === 'undefined' || stored === 'null') {
            if (stored === 'undefined' || stored === 'null') {
                localStorage.removeItem('user');
            }
            return null;
        }
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
            return parsed;
        }
        localStorage.removeItem('user');
        return null;
    } catch {
        localStorage.removeItem('user');
        return null;
    }
};

export const setStoredUser = (user: any): void => {
    if (typeof window === 'undefined') return;
    if (user && typeof user === 'object') {
        localStorage.setItem('user', JSON.stringify(user));
    } else {
        localStorage.removeItem('user');
    }
};

export const clearStoredAuth = (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

export const fetchApi = async (endpoint: string, options: any = {}) => {
    const method = (options.method || 'GET').toUpperCase();
    const cacheKey = `${method}:${endpoint}`;

    // Deduplicate concurrent GET requests
    if (method === 'GET' && inflightGetRequests.has(cacheKey)) {
        return inflightGetRequests.get(cacheKey);
    }

    const executeRequest = async () => {
        const token = getStoredToken();

        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        };

        const tryFetch = async (baseUrl: string) => {
            const response = await fetch(`${baseUrl}${endpoint}`, {
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
                    const isAuthEndpoint = endpoint.includes('/auth/login') || endpoint.includes('/auth/register');
                    if (!isAuthEndpoint) {
                        clearStoredAuth();
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
        };

        try {
            return await tryFetch(API_URL);
        } catch (error: any) {
            // If HTTP status exists (e.g. 400, 401, 404, 500), throw directly
            if (error.status) {
                throw error;
            }

            // If primary URL failed to fetch (e.g. remote Render backend sleeping or offline), retry with local backend
            if (API_URL !== DEFAULT_LOCAL) {
                try {
                    return await tryFetch(DEFAULT_LOCAL);
                } catch (fallbackErr: any) {
                    if (fallbackErr.status) throw fallbackErr;
                }
            }

            // Handle network failure gracefully
            console.warn(`API Network Connection Failed [${endpoint}]`);

            const isAuthEndpoint = endpoint.includes('/auth/');
            if (isAuthEndpoint) {
                throw new Error('Unable to connect to server. Please check backend connection.');
            }

            return {
                success: false,
                offlineFallback: true,
                data: null,
                message: 'Server unreachable. Operation saved in offline mode.'
            };
        } finally {
            if (method === 'GET') {
                inflightGetRequests.delete(cacheKey);
            }
        }
    };

    const requestPromise = executeRequest();

    if (method === 'GET') {
        inflightGetRequests.set(cacheKey, requestPromise);
    }

    return requestPromise;
};

export const api = {
    get: (endpoint: string) => fetchApi(endpoint, { method: 'GET' }),
    post: (endpoint: string, body: any) => fetchApi(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint: string, body: any) => fetchApi(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    patch: (endpoint: string, body: any) => fetchApi(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (endpoint: string) => fetchApi(endpoint, { method: 'DELETE' }),
};
