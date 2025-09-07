// API Configuration
const API_BASE_URL = 'http://145.223.81.14:8000';

// Authentication token management
let authToken = localStorage.getItem('authToken');

// API Helper functions
function getAuthHeaders() {
    return authToken ? {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
    } : {
        'Content-Type': 'application/json'
    };
}

function setAuthToken(token) {
    authToken = token;
    localStorage.setItem('authToken', token);
}

function clearAuthToken() {
    authToken = null;
    localStorage.removeItem('authToken');
}

window.isAuthenticated = function() {
    return !!authToken;
}

// API Functions
const API = {
    // Authentication
    async login(username, password) {
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            setAuthToken(data.access_token);
            return data;
        }
        throw new Error('Login failed');
    },

    async register(userData) {
        const response = await fetch(`${API_BASE_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            return await response.json();
        }
        throw new Error('Registration failed');
    },

    async getCurrentUser() {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            return await response.json();
        }
        throw new Error('Failed to get user data');
    },

    async updateProfile(userData) {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            return await response.json();
        }
        throw new Error('Failed to update profile');
    },

    // Cars
    async getCars(filters = {}) {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key]) params.append(key, filters[key]);
        });
        
        const response = await fetch(`${API_BASE_URL}/cars?${params}`);
        if (response.ok) {
            return await response.json();
        }
        throw new Error('Failed to fetch cars');
    },

    async searchCars(searchParams) {
        const params = new URLSearchParams();
        Object.keys(searchParams).forEach(key => {
            if (searchParams[key]) params.append(key, searchParams[key]);
        });
        
        const response = await fetch(`${API_BASE_URL}/cars/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(searchParams)
        });
        if (response.ok) {
            return await response.json();
        }
        throw new Error('Failed to search cars');
    },

    async getCar(carId) {
        const response = await fetch(`${API_BASE_URL}/cars/${carId}`);
        if (response.ok) {
            return await response.json();
        }
        throw new Error('Failed to fetch car details');
    },

    async getCarTypes() {
        const response = await fetch(`${API_BASE_URL}/cars/types`);
        if (response.ok) {
            return await response.json();
        }
        throw new Error('Failed to fetch car types');
    },

    // Bookings
    async createBooking(bookingData) {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(bookingData)
        });
        
        if (response.ok) {
            return await response.json();
        }
        throw new Error('Failed to create booking');
    },

    async getUserBookings() {
        const response = await fetch(`${API_BASE_URL}/bookings/me`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            return await response.json();
        }
        throw new Error('Failed to fetch bookings');
    },

    async getBooking(bookingId) {
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            return await response.json();
        }
        throw new Error('Failed to fetch booking details');
    },

    async cancelBooking(bookingId) {
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            return await response.json();
        }
        throw new Error('Failed to cancel booking');
    },

    // Contact
    async submitContactForm(contactData) {
        const response = await fetch(`${API_BASE_URL}/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contactData)
        });
        
        if (response.ok) {
            return await response.json();
        }
        throw new Error('Failed to submit contact form');
    },

    // News
    async getNews(skip = 0, limit = 10) {
        const response = await fetch(`${API_BASE_URL}/news?skip=${skip}&limit=${limit}`);
        if (response.ok) {
            return await response.json();
        }
        throw new Error('Failed to fetch news');
    },

    async getNewsItem(newsId) {
        const response = await fetch(`${API_BASE_URL}/news/${newsId}`);
        if (response.ok) {
            return await response.json();
        }
        throw new Error('Failed to fetch news item');
    },

    // Dashboard
    async getDashboardStats() {
        const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            return await response.json();
        }
        throw new Error('Failed to fetch dashboard stats');
    },

    logout() {
        clearAuthToken();
        window.location.href = 'index.html';
    },

    async addFavorite(carId) {
        const response = await fetch(`${API_BASE_URL}/users/me/favorites`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ car_id: carId })
        });
        
        if (response.ok) {
            return await response.json();
        }
        throw new Error("Failed to add car to favorites");
    },

    async removeFavorite(carId) {
        const response = await fetch(`${API_BASE_URL}/users/me/favorites/${carId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            return await response.json();
        }
        throw new Error("Failed to remove car from favorites");
    }
};

// Authentication state management
function checkAuthState() {
    const currentPage = window.location.pathname.split('/').pop();
    const protectedPages = ['account-dashboard.html', 'account-profile.html', 'account-booking.html', 'account-favorite.html'];
    
    if (protectedPages.includes(currentPage) && !isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    
    return true;
}

// Initialize auth state check on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthState();
    
    // Update navigation based on auth state
    updateNavigation();
});

function updateNavigation() {
    const loginLink = document.querySelector('a[href="login.html"]');
    const registerLink = document.querySelector('a[href="register.html"]');
    
    if (isAuthenticated()) {
        // User is logged in - show account links
        if (loginLink) {
            loginLink.textContent = 'Dashboard';
            loginLink.href = 'account-dashboard.html';
        }
        if (registerLink) {
            registerLink.textContent = 'Logout';
            registerLink.href = '#';
            registerLink.onclick = function(e) {
                e.preventDefault();
                API.logout();
            };
        }
    }
};

// Authentication state management
function checkAuthState() {
    const currentPage = window.location.pathname.split('/').pop();
    const protectedPages = ['account-dashboard.html', 'account-profile.html', 'account-booking.html', 'account-favorite.html'];
    
    if (protectedPages.includes(currentPage) && !isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    
    return true;
}

// Initialize auth state check on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthState();
    
    // Update navigation based on auth state
    updateNavigation();
});

function updateNavigation() {
    const loginLink = document.querySelector('a[href="login.html"]');
    const registerLink = document.querySelector('a[href="register.html"]');
    
    if (isAuthenticated()) {
        // User is logged in - show account links
        if (loginLink) {
            loginLink.textContent = 'Dashboard';
            loginLink.href = 'account-dashboard.html';
        }
        if (registerLink) {
            registerLink.textContent = 'Logout';
            registerLink.href = '#';
            registerLink.onclick = function(e) {
                e.preventDefault();
                API.logout();
            };
        }
    }
}


