const BASE_URL = 'http://localhost:3000/api';

// Lấy header mặc định cho mọi request
function getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method: method,
        headers: getHeaders(),
    };
    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            if (response.status >= 500) {
                throw new Error(data.message || `Lỗi Server: ${response.status}`);
            }
            return data;
        }

        return data;
    } catch (error) {
        console.error(`[Lỗi gọi API] ${method} ${endpoint}:`, error.message);
        throw error;
    }
}

const api = {
    get: (endpoint) => apiCall(endpoint, 'GET'),
    post: (endpoint, body) => apiCall(endpoint, 'POST', body),
    put: (endpoint, body) => apiCall(endpoint, 'PUT', body),
    delete: (endpoint) => apiCall(endpoint, 'DELETE')
};
