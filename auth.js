/**
 * Authentication Module - Client Side
 * Handles user registration, login, session management
 */

class AuthSystem {
    constructor() {
        this.apiBase = '/api';
        this.tokenKey = 'aiProductivityAuthToken';
        this.userKey = 'aiProductivityUser';
        this.currentUser = null;
        this.isAuthenticated = false;
        
        this.init();
    }

    init() {
        this.loadSession();
        this.updateUI();
    }

    /**
     * Load session from localStorage
     */
    loadSession() {
        const token = localStorage.getItem(this.tokenKey);
        const userData = localStorage.getItem(this.userKey);
        
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
     * Save session to localStorage
     */
    saveSession(user, token) {
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.userKey, JSON.stringify(user));
        this.currentUser = user;
        this.isAuthenticated = true;
    }

    /**
     * Clear session
     */
    clearSession() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        this.currentUser = null;
        this.isAuthenticated = false;
    }

    /**
     * Get auth headers
     */
    getHeaders() {
        const token = localStorage.getItem(this.tokenKey);
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    /**
     * Register new user (Offline mode)
     */
    async register(name, email, password, phone = '') {
        // Check if user already exists
        const existingUsers = JSON.parse(localStorage.getItem('aiProductivityUsers') || '[]');
        const userExists = existingUsers.find(u => u.email === email);

        if (userExists) {
            this.showNotification('User already exists with this email', 'error');
            return { success: false, error: 'User already exists' };
        }

        // Create new user with 300 FREE TOKENS
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            phone,
            tokens: 300, // 300 FREE TOKENS for first-time users
            isFirstTimeUser: true, // Flag for first-time user
            createdAt: new Date().toISOString()
        };

        // Save to users list
        existingUsers.push(newUser);
        localStorage.setItem('aiProductivityUsers', JSON.stringify(existingUsers));

        // Create token and save session
        const token = 'offline-token-' + newUser.id;
        this.saveSession(newUser, token);
        
        // Show celebration for first-time users
        this.showFirstTimeUserCelebration(newUser);
        
        return { success: true, user: newUser, isFirstTimeUser: true };
    }

    /**
     * Login user (Offline mode)
     */
    async login(email, password) {
        // Get users from localStorage
        const existingUsers = JSON.parse(localStorage.getItem('aiProductivityUsers') || '[]');
        const user = existingUsers.find(u => u.email === email);

        if (user) {
            // Create token and save session
            const token = 'offline-token-' + user.id;
            this.saveSession(user, token);
            this.showNotification(`Welcome back, ${user.name}!`, 'success');
            return { success: true, user: user };
        } else {
            this.showNotification('Invalid email or password', 'error');
            return { success: false, error: 'Invalid credentials' };
        }
    }

    /**
     * Logout user
     */
    logout() {
        this.clearSession();
        this.updateUI();
        this.showNotification('Logged out successfully', 'info');
    }

    /**
     * Get current user
     */
    getUser() {
        return this.currentUser;
    }

    /**
     * Check if authenticated
     */
    isLoggedIn() {
        return this.isAuthenticated;
    }

    /**
     * Get auth token
     */
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    /**
     * Fetch current user from server
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
                localStorage.setItem(this.userKey, JSON.stringify(data.user));
                return data.user;
            }
        } catch (error) {
            console.error('Fetch user error:', error);
        }
        
        return null;
    }

    /**
     * Update user profile
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
                    localStorage.setItem(this.userKey, JSON.stringify(this.currentUser));
                }
                this.showNotification('Profile updated!', 'success');
                return { success: true };
            } else {
                this.showNotification(data.error || 'Update failed', 'error');
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Update profile error:', error);
            this.showNotification('Network error', 'error');
            return { success: false, error: 'Network error' };
        }
    }

    /**
     * Request password reset
     */
    async forgotPassword(email) {
        try {
            const response = await fetch(`${this.apiBase}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification(data.message, 'success');
                return { success: true, resetLink: data.resetLink };
            } else {
                this.showNotification(data.error || 'Failed to process request', 'error');
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            this.showNotification('Network error', 'error');
            return { success: false, error: 'Network error' };
        }
    }

    /**
     * Reset password with token
     */
    async resetPassword(token, newPassword) {
        try {
            const response = await fetch(`${this.apiBase}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Password reset successfully!', 'success');
                return { success: true };
            } else {
                this.showNotification(data.error || 'Reset failed', 'error');
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Reset password error:', error);
            this.showNotification('Network error', 'error');
            return { success: false, error: 'Network error' };
        }
    }

    /**
     * Update UI based on auth state
     */
    updateUI() {
        // Update navigation
        const navAuth = document.getElementById('navAuth');
        const userDisplay = document.getElementById('userDisplay');
        const tokenDisplay = document.getElementById('tokenDisplay');
        
        if (this.isAuthenticated && this.currentUser) {
            // Show user info
            if (navAuth) navAuth.style.display = 'none';
            if (userDisplay) {
                userDisplay.innerHTML = `
                    <div class="user-menu">
                        <span class="user-name">👤 ${this.currentUser.name}</span>
                        <button onclick="authSystem.logout()" class="logout-btn">Logout</button>
                    </div>
                `;
                userDisplay.style.display = 'flex';
            }
            if (tokenDisplay) {
                tokenDisplay.innerHTML = `
                    <span>🪙 ${this.currentUser.tokens || 0} Tokens</span>
                    <button onclick="paymentSystem.openPaymentModal()">+ Buy</button>
                `;
                tokenDisplay.style.display = 'flex';
            }
        } else {
            // Show login/register buttons
            if (navAuth) navAuth.style.display = 'flex';
            if (userDisplay) userDisplay.style.display = 'none';
            // Hide token display for non-authenticated users
            if (tokenDisplay) tokenDisplay.style.display = 'none';
        }
    }

    /**
     * Show celebration for first-time users
     */
    showFirstTimeUserCelebration(user) {
        // Create celebration modal
        const modal = document.createElement('div');
        modal.id = 'firstTimeCelebration';
        modal.className = 'celebration-modal';
        modal.innerHTML = `
            <div class="celebration-content">
                <div class="celebration-icon">🎉</div>
                <h2>Welcome, ${user.name}!</h2>
                <div class="token-bonus">
                    <div class="token-amount">300</div>
                    <div class="token-label">FREE TOKENS</div>
                </div>
                <p class="celebration-message">
                    You've received <strong>300 free tokens</strong> to try all our AI tools!
                </p>
                <ul class="celebration-features">
                    <li>✍️ AI Writing Assistant</li>
                    <li>📋 AI Task Manager</li>
                    <li>💼 Business Toolkit</li>
                    <li>📚 Student Tools</li>
                </ul>
                <button class="btn btn-primary btn-lg" onclick="authSystem.closeCelebration(); openTool('writing')">
                    Start Using Tools
                </button>
                <p class="celebration-note">Each tool use costs 1 token. Buy more anytime!</p>
            </div>
        `;
        
        // Add styles
        Object.assign(modal.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '10000',
            animation: 'fadeIn 0.3s ease'
        });
        
        document.body.appendChild(modal);
        
        // Add celebration animation styles
        if (!document.getElementById('celebrationStyles')) {
            const style = document.createElement('style');
            style.id = 'celebrationStyles';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                .celebration-content {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 2.5rem;
                    border-radius: 20px;
                    text-align: center;
                    max-width: 450px;
                    width: 90%;
                    color: white;
                    animation: slideUp 0.5s ease;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }
                .celebration-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                    animation: pulse 2s infinite;
                }
                .celebration-content h2 {
                    font-size: 1.8rem;
                    margin-bottom: 1.5rem;
                    font-weight: 700;
                }
                .token-bonus {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 15px;
                    padding: 1.5rem;
                    margin: 1.5rem 0;
                    border: 3px solid #ffd700;
                }
                .token-amount {
                    font-size: 4rem;
                    font-weight: 800;
                    color: #ffd700;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                    line-height: 1;
                }
                .token-label {
                    font-size: 1.2rem;
                    font-weight: 600;
                    letter-spacing: 2px;
                    margin-top: 0.5rem;
                }
                .celebration-message {
                    font-size: 1.1rem;
                    margin: 1.5rem 0;
                    line-height: 1.6;
                }
                .celebration-features {
                    list-style: none;
                    padding: 0;
                    margin: 1.5rem 0;
                    text-align: left;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    padding: 1rem 1.5rem;
                }
                .celebration-features li {
                    padding: 0.5rem 0;
                    font-size: 1rem;
                }
                .celebration-content .btn-primary {
                    background: #ffd700;
                    color: #333;
                    font-weight: 700;
                    padding: 1rem 2rem;
                    font-size: 1.1rem;
                    border: none;
                    margin-top: 1rem;
                }
                .celebration-content .btn-primary:hover {
                    background: #ffed4e;
                    transform: translateY(-2px);
                }
                .celebration-note {
                    font-size: 0.9rem;
                    margin-top: 1rem;
                    opacity: 0.9;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Mark first-time user as welcomed
        localStorage.setItem('firstTimeUserWelcomed', 'true');
    }

    /**
     * Close celebration modal
     */
    closeCelebration() {
        const modal = document.getElementById('firstTimeCelebration');
        if (modal) {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => modal.remove(), 300);
        }
    }

    /**
     * Check if user is first-time (for showing special offers)
     */
    isFirstTimeUser() {
        const user = this.getUser();
        return user && user.isFirstTimeUser && !localStorage.getItem('firstTimeUserWelcomed');
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '100px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '9999',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            animation: 'slideIn 0.3s ease',
            background: type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : type === 'error' ? '#ef4444' : '#4f46e5'
        });
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    /**
     * Create auth modal
     */
    createAuthModal() {
        const existingModal = document.getElementById('authModal');
        if (existingModal) existingModal.remove();
        
        const modal = document.createElement('div');
        modal.id = 'authModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content auth-modal-content">
                <span class="close-btn" onclick="authSystem.closeAuthModal()">&times;</span>
                
                <!-- Login Form -->
                <div id="loginForm" class="auth-form active">
                    <div class="auth-header">
                        <div class="auth-icon">🔐</div>
                        <h2>Welcome Back</h2>
                        <p>Login to access your account</p>
                    </div>
                    
                    <form onsubmit="event.preventDefault(); authSystem.handleLogin();">
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="loginEmail" placeholder="your@email.com" required>
                        </div>
                        <div class="form-group">
                            <label>Password</label>
                            <input type="password" id="loginPassword" placeholder="Enter your password" required>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">Login</button>
                    </form>
                    
                    <div class="auth-footer">
                        <p>Don't have an account? <a href="#" onclick="authSystem.showRegister()">Register</a></p>
                        <p><a href="#" onclick="authSystem.showForgotPassword()">Forgot password?</a></p>
                    </div>
                </div>
                
                <!-- Register Form -->
                <div id="registerForm" class="auth-form" style="display:none;">
                    <div class="auth-header">
                        <div class="auth-icon">✨</div>
                        <h2>Create Account</h2>
                        <p>Join AI Productivity Tools today</p>
                    </div>
                    
                    <form onsubmit="event.preventDefault(); authSystem.handleRegister();">
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" id="regName" placeholder="John Doe" required>
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="regEmail" placeholder="your@email.com" required>
                        </div>
                        <div class="form-group">
                            <label>Phone (optional)</label>
                            <input type="tel" id="regPhone" placeholder="07XXXXXXXX">
                        </div>
                        <div class="form-group">
                            <label>Password</label>
                            <input type="password" id="regPassword" placeholder="At least 6 characters" required minlength="6">
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">Create Account</button>
                    </form>
                    
                    <div class="auth-footer">
                        <p>Already have an account? <a href="#" onclick="authSystem.showLogin()">Login</a></p>
                    </div>
                </div>
                
                <!-- Forgot Password Form -->
                <div id="forgotForm" class="auth-form" style="display:none;">
                    <div class="auth-header">
                        <div class="auth-icon">🔑</div>
                        <h2>Reset Password</h2>
                        <p>Enter your email to reset password</p>
                    </div>
                    
                    <form onsubmit="event.preventDefault(); authSystem.handleForgotPassword();">
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="forgotEmail" placeholder="your@email.com" required>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">Send Reset Link</button>
                    </form>
                    
                    <div class="auth-footer">
                        <p><a href="#" onclick="authSystem.showLogin()">Back to Login</a></p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * Open auth modal
     */
    openAuthModal(form = 'login') {
        this.createAuthModal();
        document.getElementById('authModal').classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Show specific form
        this.showForm(form);
    }

    /**
     * Close auth modal
     */
    closeAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    /**
     * Show specific form
     */
    showForm(formName) {
        document.querySelectorAll('.auth-form').forEach(form => {
            form.style.display = 'none';
        });
        document.getElementById(`${formName}Form`).style.display = 'block';
    }

    showLogin() { this.showForm('login'); }
    showRegister() { this.showForm('register'); }
    showForgotPassword() { this.showForm('forgot'); }

    /**
     * Check if user is logged in, show login modal if not
     * Returns true if logged in, false if not
     */
    requireLogin() {
        if (!this.isAuthenticated) {
            this.showNotification('Please login to access this feature', 'warning');
            this.openAuthModal('login');
            return false;
        }
        return true;
    }

    /**
     * Handle login form submission
     */
    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Try server login first, then fallback to local
        let result = null;
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (data.success) {
                result = { success: true, user: data.user };
                // Save session from server response
                this.saveSession(data.user, data.token);
            }
        } catch (e) {
            console.log('Server login failed, trying local...');
        }
        
        // Fallback to local login
        if (!result) {
            result = await this.login(email, password);
        }
        
        if (result.success) {
            this.closeAuthModal();
            this.updateUI();
            this.showNotification(`Welcome back, ${result.user.name}! You can now access all tools.`, 'success');
        }
    }

    /**
     * Handle register form submission
     */
    async handleRegister() {
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const phone = document.getElementById('regPhone').value;
        const password = document.getElementById('regPassword').value;
        
        // Try server registration first, then fallback to local
        let result = null;
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name, phone })
            });
            const data = await response.json();
            if (data.success) {
                result = { success: true, user: data.user };
                // Save session from server response
                this.saveSession(data.user, data.token);
            }
        } catch (e) {
            console.log('Server registration failed, trying local...');
        }
        
        // Fallback to local registration
        if (!result) {
            result = await this.register(name, email, password, phone);
        }
        
        if (result.success) {
            this.closeAuthModal();
            this.updateUI();
            // Celebration is shown in the register method for first-time users
            if (!result.isFirstTimeUser) {
                this.showNotification(`Welcome back, ${result.user.name}!`, 'success');
            }
        }
    }

    /**
     * Handle forgot password
     */
    async handleForgotPassword() {
        const email = document.getElementById('forgotEmail').value;
        const result = await this.forgotPassword(email);
        
        if (result.success) {
            // Show reset link for demo
            if (result.resetLink) {
                this.showNotification(`Demo: Reset link: ${result.resetLink}`, 'info');
            }
            this.showLogin();
        }
    }
}

// Initialize auth system
let authSystem;
document.addEventListener('DOMContentLoaded', () => {
    authSystem = new AuthSystem();
});

// Expose globally
window.authSystem = authSystem;
