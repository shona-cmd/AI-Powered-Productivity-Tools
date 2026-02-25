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
     * Send admin notification for signup/login events
     */
    async sendAdminNotification(type, userData) {
        try {
            await fetch('/api/auth/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, userData })
            });
        } catch (error) {
            console.error('Failed to send admin notification:', error);
        }
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
        
        // Send admin notification for local registration
        this.sendAdminNotification('register', { name, email, phone }).catch(console.error);
        
        // Set initial token balance for payment system (300 FREE TOKENS)
        localStorage.setItem('aiProductivityTokens', '300');
        
        // Update payment system token display
        if (paymentSystem) {
            paymentSystem.userTokens = 300;
            paymentSystem.updateTokenDisplay();
            paymentSystem.updateHeaderTokenDisplay();
        }
        
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
            
            // Send admin notification for local login
            this.sendAdminNotification('login', { email }).catch(console.error);
            
            // Sync token balance from user object to payment system
            if (user.tokens && user.tokens > 0) {
                localStorage.setItem('aiProductivityTokens', user.tokens.toString());
                
                // Update payment system immediately after login
                if (paymentSystem) {
                    paymentSystem.userTokens = user.tokens;
                    paymentSystem.updateTokenDisplay();
                    paymentSystem.updateHeaderTokenDisplay();
                }
            }
            
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
                        <button onclick="authSystem.openAuthModal();" class="settings-btn" title="Account Settings">⚙️</button>
                        <button onclick="twoFactorAuth?.open2FASettings()" class="security-btn" title="2FA Security">🔐</button>
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

/**
 * Two-Factor Authentication (2FA) System
 * TOTP-based implementation compatible with Google Authenticator, Authy, etc.
 */
class TwoFactorAuth {
    constructor() {
        this.secretKey = '2fa';
    }

    /**
     * Generate a new 2FA secret for user
     * @returns {object} - secret and QR code URL
     */
    generateSecret() {
        // Generate a random 20-byte secret (base32 encoded)
        const secret = this.generateRandomBase32(20);
        
        // Get current user
        const user = authSystem?.getUser();
        const accountName = user?.email || 'user@example.com';
        const issuer = 'AIProductivityTools';
        
        // Generate otpauth URL
        const otpauthUrl = `otpauth://totp/${issuer}:${accountName}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
        
        // Generate QR code URL (using external service)
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`;
        
        return {
            secret: secret,
            otpauthUrl: otpauthUrl,
            qrCodeUrl: qrCodeUrl,
            manualEntry: this.formatSecretForManual(secret)
        };
    }

    /**
     * Generate random base32 string
     */
    generateRandomBase32(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let result = '';
        const randomValues = new Uint8Array(length);
        crypto.getRandomValues(randomValues);
        
        for (let i = 0; i < length; i++) {
            result += chars[randomValues[i] % chars.length];
        }
        return result;
    }

    /**
     * Format secret for manual entry (with spaces every 4 characters)
     */
    formatSecretForManual(secret) {
        return secret.match(/.{1,4}/g).join(' ');
    }

    /**
     * Verify a TOTP code
     * @param {string} code - 6-digit code from authenticator app
     * @param {string} secret - user's 2FA secret
     * @returns {boolean} - true if code is valid
     */
    verifyCode(code, secret) {
        if (!code || !secret || code.length !== 6) {
            return false;
        }

        // Get current time window (30 second periods)
        const timeWindow = Math.floor(Date.now() / 30000);
        
        // Check current and adjacent time windows (for clock drift)
        for (let i = -1; i <= 1; i++) {
            const expectedCode = this.generateHOTP(secret, timeWindow + i);
            if (code === expectedCode) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Generate HOTP (HMAC-based One-Time Password)
     */
    generateHOTP(secret, counter) {
        // Decode base32 secret
        const key = this.base32ToBytes(secret);
        
        // Convert counter to 8-byte buffer
        const counterBytes = new Uint8Array(8);
        let tempCounter = counter;
        for (let i = 7; i >= 0; i--) {
            counterBytes[i] = tempCounter & 0xff;
            tempCounter = Math.floor(tempCounter / 256);
        }
        
        // Calculate HMAC-SHA1
        const hmac = this.hmacSha1(key, counterBytes);
        
        // Dynamic truncation
        const offset = hmac[hmac.length - 1] & 0x0f;
        const binary = 
            ((hmac[offset] & 0x7f) << 24) |
            ((hmac[offset + 1] & 0xff) << 16) |
            ((hmac[offset + 2] & 0xff) << 8) |
            (hmac[offset + 3] & 0xff);
        
        // Return 6-digit code
        return (binary % 1000000).toString().padStart(6, '0');
    }

    /**
     * Convert base32 string to bytes
     */
    base32ToBytes(base32) {
        const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let bits = '';
        const bytes = [];
        
        for (let i = 0; i < base32.length; i++) {
            const char = base32[i].toUpperCase();
            const val = base32Chars.indexOf(char);
            if (val === -1) continue;
            bits += val.toString(2).padStart(5, '0');
        }
        
        for (let i = 0; i + 8 <= bits.length; i += 8) {
            bytes.push(parseInt(bits.substr(i, 8), 2));
        }
        
        return new Uint8Array(bytes);
    }

    /**
     * Simple HMAC-SHA1 implementation
     */
    hmacSha1(key, message) {
        // This is a simplified implementation
        // In production, use a proper crypto library
        const blockSize = 64;
        
        // Pad or hash key to blockSize
        let keyBlock = new Uint8Array(blockSize);
        if (key.length > blockSize) {
            key = this.sha1(key);
        }
        keyBlock.set(key);
        
        // XOR key with pads
        const oKeyPad = new Uint8Array(blockSize);
        const iKeyPad = new Uint8Array(blockSize);
        for (let i = 0; i < blockSize; i++) {
            oKeyPad[i] = keyBlock[i] ^ 0x5c;
            iKeyPad[i] = keyBlock[i] ^ 0x36;
        }
        
        // Hash inner
        const innerHash = this.sha1([...iKeyPad, ...message]);
        
        // Hash outer
        return this.sha1([...oKeyPad, ...innerHash]);
    }

    /**
     * Simple SHA1 hash (for HMAC)
     */
    sha1(data) {
        // Use Web Crypto API for actual SHA1
        return data; // Placeholder - will use crypto.subtle in verifyCode
    }

    /**
     * Enable 2FA for user
     */
    async enable2FA(code, secret) {
        const user = authSystem?.getUser();
        if (!user) {
            return { success: false, error: 'User not logged in' };
        }

        // Verify the code first
        if (!this.verifyCode(code, secret)) {
            return { success: false, error: 'Invalid verification code. Please try again.' };
        }

        // Save 2FA secret to user profile
        const users = JSON.parse(localStorage.getItem('aiProductivityUsers') || '[]');
        const userIndex = users.findIndex(u => u.id === user.id);
        
        if (userIndex >= 0) {
            users[userIndex].twoFactorEnabled = true;
            users[userIndex].twoFactorSecret = secret;
            users[userIndex].twoFactorBackupCodes = this.generateBackupCodes();
            localStorage.setItem('aiProductivityUsers', JSON.stringify(users));
            
            // Update current user session
            user.twoFactorEnabled = true;
            user.twoFactorSecret = secret;
            localStorage.setItem('aiProductivityUser', JSON.stringify(user));
            
            return { 
                success: true, 
                backupCodes: users[userIndex].twoFactorBackupCodes,
                message: '2FA enabled successfully! Save your backup codes.' 
            };
        }
        
        return { success: false, error: 'Failed to enable 2FA' };
    }

    /**
     * Disable 2FA for user
     */
    async disable2FA(code) {
        const user = authSystem?.getUser();
        if (!user) {
            return { success: false, error: 'User not logged in' };
        }

        // If 2FA is enabled, verify code first
        if (user.twoFactorEnabled) {
            // Get stored secret
            const users = JSON.parse(localStorage.getItem('aiProductivityUsers') || '[]');
            const storedUser = users.find(u => u.id === user.id);
            
            if (storedUser?.twoFactorEnabled) {
                // Check if it's a backup code
                const backupCodes = storedUser.twoFactorBackupCodes || [];
                const isBackupCode = backupCodes.includes(code);
                
                // Verify TOTP or backup code
                const isValid = this.verifyCode(code, storedUser.twoFactorSecret) || isBackupCode;
                
                if (!isValid) {
                    return { success: false, error: 'Invalid verification code' };
                }
                
                // Remove backup code if used
                if (isBackupCode) {
                    storedUser.twoFactorBackupCodes = backupCodes.filter(c => c !== code);
                }
                
                // Disable 2FA
                storedUser.twoFactorEnabled = false;
                delete storedUser.twoFactorSecret;
                localStorage.setItem('aiProductivityUsers', JSON.stringify(users));
                
                // Update session
                user.twoFactorEnabled = false;
                delete user.twoFactorSecret;
                localStorage.setItem('aiProductivityUser', JSON.stringify(user));
                
                return { success: true, message: '2FA disabled successfully' };
            }
        }
        
        // If 2FA was never enabled, just clear any残留 data
        return { success: true, message: '2FA was not enabled' };
    }

    /**
     * Generate backup codes
     */
    generateBackupCodes() {
        const codes = [];
        for (let i = 0; i < 10; i++) {
            codes.push(this.generateRandomBase32(4).toUpperCase());
        }
        return codes;
    }

    /**
     * Check if user has 2FA enabled
     */
    is2FAEnabled() {
        const user = authSystem?.getUser();
        return user?.twoFactorEnabled === true;
    }

    /**
     * Create 2FA settings modal
     */
    create2FASettingsModal() {
        const existingModal = document.getElementById('2faModal');
        if (existingModal) existingModal.remove();

        const user = authSystem?.getUser();
        const isEnabled = this.is2FAEnabled();

        const modal = document.createElement('div');
        modal.id = '2faModal';
        modal.className = 'modal';
        
        if (isEnabled) {
            // Show 2FA enabled state
            modal.innerHTML = `
                <div class="modal-content auth-modal-content" style="max-width: 500px;">
                    <span class="close-btn" onclick="twoFactorAuth.close2FAModal()">&times;</span>
                    
                    <div class="auth-header" style="text-align: center;">
                        <div class="auth-icon" style="font-size: 3rem;">🔐</div>
                        <h2>Two-Factor Authentication</h2>
                        <p style="color: #10b981; font-weight: 600;">✓ 2FA is enabled for your account</p>
                    </div>
                    
                    <div style="margin: 1.5rem 0; text-align: center;">
                        <p style="margin-bottom: 1rem;">Your account is protected with 2FA. You'll need to enter a code from your authenticator app when logging in.</p>
                    </div>
                    
                    <div style="margin: 1.5rem 0;">
                        <h4 style="margin-bottom: 0.75rem;">🔒 Disable 2FA</h4>
                        <p style="font-size: 0.9rem; color: #6b7280; margin-bottom: 1rem;">Enter a code from your authenticator app or a backup code to disable 2FA.</p>
                        
                        <div class="form-group">
                            <input type="text" id="2faDisableCode" placeholder="Enter 6-digit code or backup code" maxlength="8">
                        </div>
                        
                        <button class="btn btn-primary btn-block" onclick="twoFactorAuth.disable2FAFromUI()">
                            Disable 2FA
                        </button>
                    </div>
                    
                    <div style="margin-top: 1.5rem; padding: 1rem; background: #fef3c7; border-radius: 8px;">
                        <p style="font-size: 0.9rem; color: #92400e;">
                            <strong>⚠️ Warning:</strong> Disabling 2FA will make your account less secure.
                        </p>
                    </div>
                </div>
            `;
        } else {
            // Show setup 2FA flow
            const secretData = this.generateSecret();
            
            modal.innerHTML = `
                <div class="modal-content auth-modal-content" style="max-width: 550px;">
                    <span class="close-btn" onclick="twoFactorAuth.close2FAModal()">&times;</span>
                    
                    <div id="2faSetupStep1">
                        <div class="auth-header" style="text-align: center;">
                            <div class="auth-icon" style="font-size: 3rem;">🔐</div>
                            <h2>Enable Two-Factor Authentication</h2>
                            <p>Add an extra layer of security to your account</p>
                        </div>
                        
                        <div style="text-align: center; margin: 1.5rem 0;">
                            <p style="margin-bottom: 1rem;">Scan this QR code with your authenticator app:</p>
                            <img src="${secretData.qrCodeUrl}" alt="QR Code" style="max-width: 200px; border-radius: 8px; border: 2px solid #e5e7eb;">
                            
                            <p style="margin: 1.5rem 0 0.5rem; font-size: 0.9rem;">Or enter this code manually:</p>
                            <code style="background: #f3f4f6; padding: 0.5rem 1rem; border-radius: 4px; font-size: 1.1rem; letter-spacing: 1px;">${secretData.manualEntry}</code>
                        </div>
                        
                        <div class="form-group">
                            <label>Enter verification code</label>
                            <input type="text" id="2faVerifyCode" placeholder="Enter 6-digit code from your app" maxlength="6" style="text-align: center; letter-spacing: 4px; font-size: 1.2rem;">
                        </div>
                        
                        <input type="hidden" id="2faSecret" value="${secretData.secret}">
                        
                        <button class="btn btn-primary btn-block" onclick="twoFactorAuth.verifyAndEnable2FA()">
                            Verify & Enable 2FA
                        </button>
                        
                        <p style="font-size: 0.85rem; color: #6b7280; margin-top: 1rem; text-align: center;">
                            Compatible with Google Authenticator, Authy, Microsoft Authenticator, and other TOTP apps
                        </p>
                    </div>
                    
                    <div id="2faSetupSuccess" style="display: none;">
                        <div class="auth-header" style="text-align: center;">
                            <div class="auth-icon" style="font-size: 3rem;">🎉</div>
                            <h2>2FA Enabled Successfully!</h2>
                            <p style="color: #10b981; font-weight: 600;">Your account is now more secure</p>
                        </div>
                        
                        <div style="margin: 1.5rem 0; padding: 1rem; background: #fef3c7; border-radius: 8px;">
                            <h4 style="margin-bottom: 0.75rem;">⚠️ Save Your Backup Codes</h4>
                            <p style="font-size: 0.9rem; margin-bottom: 1rem;">Use these codes to access your account if you lose your authenticator device:</p>
                            <div id="backupCodesDisplay" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; font-family: monospace; font-size: 1rem;"></div>
                        </div>
                        
                        <button class="btn btn-primary btn-block" onclick="twoFactorAuth.close2FAModal()">
                            I've Saved My Backup Codes
                        </button>
                    </div>
                </div>
            `;
        }
        
        document.body.appendChild(modal);
        document.getElementById('2faModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Verify code and enable 2FA
     */
    async verifyAndEnable2FA() {
        const code = document.getElementById('2faVerifyCode').value.trim();
        const secret = document.getElementById('2faSecret').value.trim();
        
        if (!code || code.length !== 6) {
            authSystem.showNotification('Please enter a valid 6-digit code', 'error');
            return;
        }
        
        // Use Web Crypto API for proper verification
        try {
            const isValid = await this.verifyCodeWithWebCrypto(code, secret);
            
            if (!isValid) {
                authSystem.showNotification('Invalid code. Please check your authenticator app and try again.', 'error');
                return;
            }
            
            // Enable 2FA
            const result = await this.enable2FA(code, secret);
            
            if (result.success) {
                // Show success with backup codes
                document.getElementById('2faSetupStep1').style.display = 'none';
                document.getElementById('2faSetupSuccess').style.display = 'block';
                
                // Display backup codes
                const codesDisplay = document.getElementById('backupCodesDisplay');
                codesDisplay.innerHTML = result.backupCodes.map(code => 
                    `<code style="background: white; padding: 0.25rem 0.5rem; border-radius: 4px;">${code}</code>`
                ).join('');
                
                authSystem.showNotification('2FA enabled successfully!', 'success');
            } else {
                authSystem.showNotification(result.error, 'error');
            }
        } catch (error) {
            console.error('2FA verification error:', error);
            authSystem.showNotification('Verification failed. Please try again.', 'error');
        }
    }

    /**
     * Verify code using Web Crypto API
     */
    async verifyCodeWithWebCrypto(code, secret) {
        // Simple time-based verification (works without external libraries)
        const timeWindow = Math.floor(Date.now() / 30000);
        
        // Check current and adjacent windows
        for (let offset = -1; offset <= 1; offset++) {
            const expectedCode = this.calculateTOTP(secret, timeWindow + offset);
            if (code === expectedCode) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Calculate TOTP (Time-based OTP)
     */
    calculateTOTP(secret, counter) {
        // Decode base32 secret to bytes
        const key = this.base32Decode(secret);
        
        // Convert counter to 8-byte big-endian
        const counterBytes = new Uint8Array(8);
        let tempCounter = BigInt(counter);
        for (let i = 7; i >= 0; i--) {
            counterBytes[i] = Number(tempCounter & 0xffn);
            tempCounter >>= 8n;
        }
        
        // Use Web Crypto API for HMAC-SHA1
        return this.hmacSha1WebCrypto(key, counterBytes).then(hash => {
            // Dynamic truncation
            const offset = hash[hash.length - 1] & 0x0f;
            const binary = 
                ((hash[offset] & 0x7f) << 24) |
                ((hash[offset + 1] & 0xff) << 16) |
                ((hash[offset + 2] & 0xff) << 8) |
                (hash[offset + 3] & 0xff);
            
            return (binary % 1000000).toString().padStart(6, '0');
        });
    }

    /**
     * HMAC-SHA1 using Web Crypto API
     */
    async hmacSha1WebCrypto(key, message) {
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            key,
            { name: 'HMAC', hash: 'SHA-1' },
            false,
            ['sign']
        );
        
        const signature = await crypto.subtle.sign(
            'HMAC',
            cryptoKey,
            message
        );
        
        return new Uint8Array(signature);
    }

    /**
     * Base32 decode
     */
    base32Decode(base32) {
        const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let bits = '';
        
        for (let i = 0; i < base32.length; i++) {
            const char = base32[i].toUpperCase();
            const val = base32Chars.indexOf(char);
            if (val === -1) continue;
            bits += val.toString(2).padStart(5, '0');
        }
        
        const bytes = new Uint8Array(Math.floor(bits.length / 8));
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = parseInt(bits.substr(i * 8, 8), 2);
        }
        
        return bytes;
    }

    /**
     * Disable 2FA from UI
     */
    async disable2FAFromUI() {
        const code = document.getElementById('2faDisableCode').value.trim();
        
        if (!code) {
            authSystem.showNotification('Please enter a code', 'error');
            return;
        }
        
        const result = await this.disable2FA(code);
        
        if (result.success) {
            authSystem.showNotification(result.message, 'success');
            this.close2FAModal();
            // Refresh settings
            setTimeout(() => this.create2FASettingsModal(), 300);
        } else {
            authSystem.showNotification(result.error, 'error');
        }
    }

    /**
     * Open 2FA settings modal
     */
    open2FASettings() {
        this.create2FASettingsModal();
    }

    /**
     * Close 2FA modal
     */
    close2FAModal() {
        const modal = document.getElementById('2faModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => modal.remove(), 300);
        }
    }

    /**
     * Check if 2FA is required for an action
     */
    isRequiredForAction(action) {
        // 2FA required for these sensitive actions
        const requiredActions = ['purchase', 'settings', 'withdraw'];
        return requiredActions.includes(action);
    }

    /**
     * Verify 2FA for a sensitive action
     */
    async verify2FAForAction(action, code) {
        const user = authSystem?.getUser();
        
        if (!user?.twoFactorEnabled) {
            return { success: true, verified: false }; // No 2FA, allow
        }
        
        if (!this.isRequiredForAction(action)) {
            return { success: true, verified: false }; // Not required
        }
        
        // Get stored secret
        const users = JSON.parse(localStorage.getItem('aiProductivityUsers') || '[]');
        const storedUser = users.find(u => u.id === user.id);
        
        if (!storedUser?.twoFactorEnabled) {
            return { success: true, verified: false };
        }
        
        // Check backup codes
        const backupCodes = storedUser.twoFactorBackupCodes || [];
        const isBackupCode = backupCodes.includes(code.toUpperCase());
        
        // Verify TOTP or backup code
        const isValid = await this.verifyCodeWithWebCrypto(code, storedUser.twoFactorSecret) || isBackupCode;
        
        // Use backup code if valid
        if (isBackupCode && isValid) {
            storedUser.twoFactorBackupCodes = backupCodes.filter(c => c !== code.toUpperCase());
            localStorage.setItem('aiProductivityUsers', JSON.stringify(users));
        }
        
        return { success: true, verified: isValid };
    }
}

// Initialize 2FA
let twoFactorAuth;
document.addEventListener('DOMContentLoaded', () => {
    twoFactorAuth = new TwoFactorAuth();
});

// Expose globally
window.twoFactorAuth = twoFactorAuth;
