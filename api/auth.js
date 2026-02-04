/**
 * Authentication API for Vercel Serverless
 * 
 * Handles user registration, login, and session management
 * Uses Supabase for database (free tier available)
 */

const crypto = require('crypto');

// Configuration - Replace with your Supabase credentials
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'your-service-key';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

/**
 * Generate JWT token
 */
function generateToken(userId, email) {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
        userId,
        email,
        iat: Date.now(),
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    })).toString('base64url');
    
    const signature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${header}.${payload}`)
        .digest('base64url');
    
    return `${header}.${payload}.${signature}`;
}

/**
 * Verify JWT token
 */
function verifyToken(token) {
    try {
        const [header, payload, signature] = token.split('.');
        const expectedSignature = crypto
            .createHmac('sha256', JWT_SECRET)
            .update(`${header}.${payload}`)
            .digest('base64url');
        
        if (signature !== expectedSignature) return null;
        
        const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());
        if (decoded.exp < Date.now()) return null;
        
        return decoded;
    } catch (e) {
        return null;
    }
}

/**
 * Supabase REST API helper
 */
async function supabaseRequest(method, endpoint, body = null) {
    const options = {
        method,
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
        }
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1${endpoint}`, options);
    return response;
}

/**
 * Register new user
 * POST /api/auth/register
 */
async function register(req, res) {
    const { email, password, name, phone } = req.body;
    
    // Validate input
    if (!email || !password || !name) {
        return res.status(400).json({ 
            error: 'Email, password, and name are required' 
        });
    }
    
    // Password validation
    if (password.length < 6) {
        return res.status(400).json({ 
            error: 'Password must be at least 6 characters' 
        });
    }
    
    try {
        // Check if user exists
        const checkResponse = await supabaseRequest('GET', `/users?email=eq.${encodeURIComponent(email)}`);
        if (checkResponse.ok && (await checkResponse.json()).length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        // Hash password
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
        
        // Create user
        const createResponse = await supabaseRequest('POST', '/users', {
            email,
            password_hash: passwordHash,
            name,
            phone: phone || null,
            created_at: new Date().toISOString(),
            tokens: 0, // Free welcome bonus
            email_verified: false
        });
        
        if (!createResponse.ok) {
            throw new Error('Failed to create user');
        }
        
        // Get created user
        const userData = (await supabaseRequest('GET', `/users?email=eq.${encodeURIComponent(email)}`)).json();
        const user = userData[0];
        
        // Generate token
        const token = generateToken(user.id, user.email);
        
        res.status(201).json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                tokens: user.tokens
            },
            token
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
}

/**
 * Login user
 * POST /api/auth/login
 */
async function login(req, res) {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }
    
    try {
        // Get user by email
        const response = await supabaseRequest('GET', `/users?email=eq.${encodeURIComponent(email)}`);
        const users = await response.json();
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = users[0];
        
        // Verify password
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
        if (user.password_hash !== passwordHash) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Generate token
        const token = generateToken(user.id, user.email);
        
        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                tokens: user.tokens
            },
            token
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
}

/**
 * Get current user profile
 * GET /api/auth/me
 */
async function me(req, res) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    try {
        const response = await supabaseRequest('GET', `/users?id=eq.${decoded.userId}`);
        const users = await response.json();
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const user = users[0];
        
        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                tokens: user.tokens,
                created_at: user.created_at
            }
        });
        
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
}

/**
 * Update user profile
 * PATCH /api/auth/update
 */
async function update(req, res) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    const { name, phone, currentPassword, newPassword } = req.body;
    
    try {
        // Get current user
        const response = await supabaseRequest('GET', `/users?id=eq.${decoded.userId}`);
        const users = await response.json();
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const user = users[0];
        const updates = {};
        
        // Update name
        if (name) updates.name = name;
        
        // Update phone
        if (phone !== undefined) updates.phone = phone;
        
        // Update password if provided
        if (currentPassword && newPassword) {
            const currentHash = crypto.createHash('sha256').update(currentPassword).digest('hex');
            if (user.password_hash !== currentHash) {
                return res.status(400).json({ error: 'Current password is incorrect' });
            }
            updates.password_hash = crypto.createHash('sha256').update(newPassword).digest('hex');
        }
        
        updates.updated_at = new Date().toISOString();
        
        // Apply updates
        await supabaseRequest('PATCH', `/users?id=eq.${decoded.userId}`, updates);
        
        res.json({
            success: true,
            message: 'Profile updated successfully',
            updates
        });
        
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ error: 'Update failed' });
    }
}

/**
 * Logout (client-side token removal)
 * POST /api/auth/logout
 */
async function logout(req, res) {
    res.json({
        success: true,
        message: 'Logged out successfully. Please remove token from client.'
    });
}

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
async function forgotPassword(req, res) {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ error: 'Email required' });
    }
    
    try {
        // Check if user exists
        const response = await supabaseRequest('GET', `/users?email=eq.${encodeURIComponent(email)}`);
        const users = await response.json();
        
        if (users.length === 0) {
            // Don't reveal if email exists
            return res.json({
                success: true,
                message: 'If an account exists, a reset link has been sent'
            });
        }
        
        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
        
        await supabaseRequest('PATCH', `/users?id=eq.${users[0].id}`, {
            reset_token: resetToken,
            reset_expires: resetExpires
        });
        
        // In production, send email here
        // await sendEmail(email, 'Password Reset', `Reset link: https://yoursite.com/reset?token=${resetToken}`);
        
        res.json({
            success: true,
            message: 'If an account exists, a reset link has been sent',
            // Remove in production:
            resetLink: `/reset-password?token=${resetToken}`
        });
        
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
}

/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
async function resetPassword(req, res) {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token and new password required' });
    }
    
    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    try {
        // Find user with valid reset token
        const response = await supabaseRequest('GET', `/users?reset_token=eq.${token}`);
        const users = await response.json();
        
        if (users.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }
        
        const user = users[0];
        
        // Check if token expired
        if (new Date(user.reset_expires) < new Date()) {
            return res.status(400).json({ error: 'Reset token has expired' });
        }
        
        // Update password
        const newHash = crypto.createHash('sha256').update(newPassword).digest('hex');
        await supabaseRequest('PATCH', `/users?id=eq.${user.id}`, {
            password_hash: newHash,
            reset_token: null,
            reset_expires: null
        });
        
        res.json({
            success: true,
            message: 'Password reset successfully'
        });
        
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
}

/**
 * Handle CORS
 */
function handleCors(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
}

/**
 * Main handler
 */
async function handler(req, res) {
    handleCors(req, res);
    
    const { method, url } = req;
    
    // Parse path
    const path = url.split('?')[0];
    
    try {
        let response;
        
        if (path === '/api/auth/register' && method === 'POST') {
            response = await register(req.body);
        } else if (path === '/api/auth/login' && method === 'POST') {
            response = await login(req.body);
        } else if (path === '/api/auth/me' && method === 'GET') {
            response = await me(req, res);
        } else if (path === '/api/auth/update' && method === 'PATCH') {
            response = await update(req, res);
        } else if (path === '/api/auth/logout' && method === 'POST') {
            response = await logout();
        } else if (path === '/api/auth/forgot-password' && method === 'POST') {
            response = await forgotPassword(req.body);
        } else if (path === '/api/auth/reset-password' && method === 'POST') {
            response = await resetPassword(req.body);
        } else {
            response = { status: 404, body: { error: 'Endpoint not found' } };
        }
        
        res.status(response.status);
        res.json(response.body);
        
    } catch (error) {
        console.error('Auth API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = handler;

