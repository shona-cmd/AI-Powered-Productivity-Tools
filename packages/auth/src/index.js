/**
 * Authentication Module
 * Handles user registration, login, and session management
 * 
 * @module @ai-productivity/auth
 */

class AuthSystem {
    constructor(options = {}) {
        this.apiBase = options.apiBase || '/api';
        this.tokenKey = options.tokenKey || 'aiProductivityAuthToken';
        this.userKey = options.userKey || 'aiProductivityUser';
        this.currentUser = null;
        this.isAuthenticated = false;
        this.storage = options.storage || localStorage;
        
        this.init();
    }

    init() {
        this.loadSession();
    }

    /**
     * Load session from storage
     * @returns {boolean}
     */
    loadSession() {
        const token = this.storage.getItem(this.tokenKey);
        const userData = this.storage.getItem(this.userKey);
        
        if (token && userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.isAuthenticated = true;
                return true;
            } catch (e) {
                this.logout();
            }
        }
        return false;
    }

    /**
     * Save session to storage
     * @param {object} user - User object
     * @param {string} token - Auth token
     */
    saveSession(user, token) {
        this.storage.setItem(this.tokenKey, token);
        this.storage.setItem(this.userKey, JSON.stringify(user));
        this.currentUser = user;
        this.isAuthenticated = true;
    }

    /**
     * Clear session
     */
    clearSession() {
        this.storage.removeItem(this.tokenKey);
        this.storage.removeItem(this.userKey);
        this.currentUser = null;
        this.isAuthenticated = false;
    }

    /**
     * Get auth headers
     * @returns {object}
     */
    getHeaders() {
        const token = this.storage.getItem(this.tokenKey);
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    /**
     * Register new user (Offline mode)
     * @param {string} name - User name
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {string} phone - User phone (optional)
     * @returns {Promise<object>}
     */
    async register(name, email, password, phone = '') {
        // Check if user already exists
        const existingUsers = JSON.parse(this.storage.getItem('aiProductivityUsers') || '[]');
        const userExists = existingUsers.find(u => u.email === email);

        if (userExists) {
            return { success: false, error: 'User already exists' };
        }

        // Create new user with 300 FREE TOKENS
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            phone,
            tokens: 300,
            isFirstTimeUser: true,
            createdAt: new Date().toISOString()
        };

        // Save to users list
        existingUsers.push(newUser);
        this.storage.setItem('aiProductivityUsers', JSON.stringify(existingUsers));

        // Create token and save session
        const token = 'offline-token-' + newUser.id;
        this.saveSession(newUser, token);
        
        // Set initial token balance
        this.storage.setItem('aiProductivityTokens', '300');
        
        return { success: true, user: newUser, isFirstTimeUser: true };
    }

    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<object>}
     */
    async login(email, password) {
        // Get users from storage
        const existingUsers = JSON.parse(this.storage.getItem('aiProductivityUsers') || '[]');
        const user = existingUsers.find(u => u.email === email);

        if (user) {
            // Create token and save session
            const token = 'offline-token-' + user.id;
            this.saveSession(user, token);
            
            // Sync token balance
            if (user.tokens && user.tokens > 0) {
                this.storage.setItem('aiProductivityTokens', user.tokens.toString());
            }
            
            return { success: true, user: user };
        } else {
            return { success: false, error: 'Invalid credentials' };
        }
    }

    /**
     * Logout user
     */
    logout() {
        this.clearSession();
    }

    /**
     * Get current user
     * @returns {object|null}
     */
    getUser() {
        return this.currentUser;
    }

    /**
     * Check if authenticated
     * @returns {boolean}
     */
    isLoggedIn() {
        return this.isAuthenticated;
    }

    /**
     * Get auth token
     * @returns {string|null}
     */
    getToken() {
        return this.storage.getItem(this.tokenKey);
    }

    /**
     * Fetch current user from server
     * @returns {Promise<object|null>}
     */
    async fetchUser() {
        const token = this.getToken();
        if (!token) return null;
        
        try {
            const response = await fetch(`${this.apiBase}/auth/me`, {
                headers: this.getHeaders()
            });
            
            const data = await response.json();
            
            if (data.user) {
                this.currentUser = data.user;
                this.storage.setItem(this.userKey, JSON.stringify(data.user));
                return data.user;
            }
        } catch (error) {
            console.error('Fetch user error:', error);
        }
        
        return null;
    }

    /**
     * Update user profile
     * @param {object} updates - Profile updates
     * @returns {Promise<object>}
     */
    async updateProfile(updates) {
        try {
            const response = await fetch(`${this.apiBase}/auth/update`, {
                method: 'PATCH',
                headers: this.getHeaders(),
                body: JSON.stringify(updates)
            });
            
            const data = await response.json();
            
            if (data.success) {
                if (this.currentUser) {
                    this.currentUser = { ...this.currentUser, ...data.updates };
                    this.storage.setItem(this.userKey, JSON.stringify(this.currentUser));
                }
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Update profile error:', error);
            return { success: false, error: 'Network error' };
        }
    }

    /**
     * Request password reset
     * @param {string} email - User email
     * @returns {Promise<object>}
     */
    async forgotPassword(email) {
        try {
            const response = await fetch(`${this.apiBase}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Forgot password error:', error);
            return { success: false, error: 'Network error' };
        }
    }

    /**
     * Reset password with token
     * @param {string} token - Reset token
     * @param {string} newPassword - New password
     * @returns {Promise<object>}
     */
    async resetPassword(token, newPassword) {
        try {
            const response = await fetch(`${this.apiBase}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword })
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Reset password error:', error);
            return { success: false, error: 'Network error' };
        }
    }

    /**
     * Check if user is first-time
     * @returns {boolean}
     */
    isFirstTimeUser() {
        const user = this.getUser();
        return user && user.isFirstTimeUser;
    }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthSystem;
} else if (typeof window !== 'undefined') {
    window.AuthSystem = AuthSystem;
}

export default AuthSystem;
export { AuthSystem };
