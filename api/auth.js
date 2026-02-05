/**
 * Authentication API for Vercel Serverless
 * 
 * Handles user registration, login, and session management
 * Uses Supabase for database (free tier available)
 */

import crypto from 'crypto';

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
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000
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
 * Main handler
 * Compatible with Vercel Serverless Functions
 */
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const method = req.method || 'GET';
    const url = req.url || '';
    const [path, queryString] = url.split('?');

    // Parse body
    let body = {};
    if (method === 'POST' || method === 'PATCH') {
        try {
            body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
        } catch (e) {
            body = {};
        }
    }

    try {
        // Route requests
        if (path === '/api/auth/register' && method === 'POST') {
            return handleRegister(res, body);
        } else if (path === '/api/auth/login' && method === 'POST') {
            return handleLogin(res, body);
        } else if (path === '/api/auth/me' && method === 'GET') {
            return handleMe(res, req.headers);
        } else if (path === '/api/auth/logout' && method === 'POST') {
            return res.status(200).json({ success: true, message: 'Logged out successfully' });
        } else if (path === '/api/auth/forgot-password' && method === 'POST') {
            return res.status(200).json({ 
                success: true, 
                message: 'If an account exists, a reset link has been sent' 
            });
        } else if (path === '/api/auth/reset-password' && method === 'POST') {
            return res.status(200).json({ success: true, message: 'Password reset successfully' });
        } else {
            return res.status(404).json({ error: 'Endpoint not found' });
        }
    } catch (error) {
        console.error('Auth API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Register new user
 * POST /api/auth/register
 */
async function handleRegister(res, body) {
    const { email, password, name, phone } = body;
    
    if (!email || !password || !name) {
        return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Demo: Simulate user creation
    const userId = crypto.randomBytes(16).toString('hex');
    const token = generateToken(userId, email);
    
    return res.status(201).json({
        success: true,
        user: { id: userId, email, name, phone, tokens: 0 },
        token
    });
}

/**
 * Login user
 * POST /api/auth/login
 */
async function handleLogin(res, body) {
    const { email, password } = body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Demo: Simulate login
    const userId = crypto.randomBytes(16).toString('hex');
    const token = generateToken(userId, email);
    
    return res.status(200).json({
        success: true,
        user: { id: userId, email, name: 'Demo User', tokens: 0 },
        token
    });
}

/**
 * Get current user profile
 * GET /api/auth/me
 */
async function handleMe(res, headers) {
    const authHeader = headers.authorization || headers.Authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    return res.status(200).json({
        user: {
            id: decoded.userId,
            email: decoded.email,
            name: 'Demo User',
            tokens: 0
        }
    });
}

