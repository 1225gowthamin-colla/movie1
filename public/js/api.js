const API_URL = '/api';

const api = {
    // Helper to get token
    getToken: () => localStorage.getItem('token'),
    
    // Universal Fetch wrapper
    request: async (endpoint, method = 'GET', body = null) => {
        const token = api.getToken();
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const config = {
            method,
            headers
        };
        
        if (body) {
            config.body = JSON.stringify(body);
        }
        
        try {
            const response = await fetch(`${API_URL}${endpoint}`, config);
            const data = await response.json();
            
            if (!response.ok) {
                if (response.status === 401) {
                    // Unauthorized - Clear token and redirect to login
                    localStorage.removeItem('token');
                    if (!window.location.pathname.includes('login.html')) {
                        window.location.href = '/login.html';
                    }
                }
                throw new Error(data.message || 'Something went wrong');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Auth methods
    login: (credentials) => api.request('/auth/login', 'POST', credentials),
    register: (userData) => api.request('/auth/register', 'POST', userData),
    getMe: () => api.request('/auth/me'),

    // Student methods
    getStudents: () => api.request('/students'),
    getStudent: (id) => api.request(`/students/${id}`),

    // Attendance methods
    markAttendance: (coords) => api.request('/attendance/mark', 'POST', coords),
    getAttendanceHistory: () => api.request('/attendance/history'),

    // Analytics methods
    getOverview: () => api.request('/analytics/overview'),
    getTrends: () => api.request('/analytics/trends'),
    getAIInsights: () => api.request('/analytics/ai-insights'),
};

// UI Helpers
const ui = {
    showToast: (message, type = 'info') => {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Basic toast styling via JS if not in CSS
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '12px 24px',
            borderRadius: '8px',
            color: 'white',
            zIndex: '10000',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6',
            transition: 'opacity 0.3s'
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

window.api = api;
window.ui = ui;
