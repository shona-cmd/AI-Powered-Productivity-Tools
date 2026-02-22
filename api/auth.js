/**
 * Authentication API for Vercel Serverless
 *
 * Handles user registration, login, and session management
 * Includes email notifications for admin
 *
 * Version 4.0 - Added email notifications
 * Changed to CommonJS exports for consistent serverless behavior
 */

// Load environment variables
require('dotenv').config();

// Using CommonJS for consistent Vercel serverless behavior
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Get JWT secret from environment, with safe fallback
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-do-not-use-in-production';

// Admin email for notifications
const ADMIN_EMAIL = 'nathanielkuts@gmail.com';

// Email transporter configuration
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  
  // Create transporter using Gmail App Password
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER || 'nathanielkuts@gmail.com',
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });
  
  return transporter;
}

/**
 * Send admin notification email
 */
async function sendAdminNotification(type, userData) {
  try {
    const transport = getTransporter();
    
    let subject = '';
    let htmlContent = '';
    
    if (type === 'register') {
      subject = '🔔 New User Registration - AI Productivity Tools';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #4f46e5;">New User Registration</h2>
          <p>A new user has registered on AI Productivity Tools!</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Name</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${userData.name || 'N/A'}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Email</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${userData.email}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Phone</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${userData.phone || 'Not provided'}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Time</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${new Date().toLocaleString()}</td></tr>
          </table>
        </div>
      `;
    } else if (type === 'login') {
      subject = '🔔 User Login Notification - AI Productivity Tools';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #10b981;">User Login</h2>
          <p>A user has logged in to AI Productivity Tools!</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Email</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${userData.email}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Time</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${new Date().toLocaleString()}</td></tr>
          </table>
        </div>
      `;
    }
    
    // Only send if GMAIL_APP_PASSWORD is configured
    if (!process.env.GMAIL_APP_PASSWORD) {
      console.log('Email notification (demo mode - no App Password):', subject, userData);
      return { success: false, demo: true };
    }
    
    const result = await transport.sendMail({
      from: process.env.GMAIL_USER || 'nathanielkuts@gmail.com',
      to: ADMIN_EMAIL,
      subject: subject,
      html: htmlContent
    });
    
    console.log('Admin notification sent:', type);
    return { success: true };
  } catch (error) {
    console.error('Failed to send admin notification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate JWT token
 * Fixed: Added try-catch for all operations
 */
function generateToken(userId, email) {
  try {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };
    
    const payload = {
      userId,
      email,
      iat: Date.now(),
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    };
    
    const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    
    const signature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');
    
    return `${headerB64}.${payloadB64}.${signature}`;
  } catch (error) {
    console.error('Token generation error:', error);
    throw new Error('Failed to generate token');
  }
}

/**
 * Verify JWT token
 * Fixed: Comprehensive error handling for malformed tokens
 */
function verifyToken(token) {
  if (!token || typeof token !== 'string') {
    return null;
  }
  
  try {
    const parts = token.split('.');
    
    // JWT must have exactly 3 parts
    if (parts.length !== 3) {
      return null;
    }
    
    const [headerB64, payloadB64, signature] = parts;
    
    // Validate base64url encoding
    if (!headerB64 || !payloadB64 || !signature) {
      return null;
    }
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');
    
    if (signature !== expectedSignature) {
      return null;
    }
    
    // Decode and validate payload
    const payloadStr = Buffer.from(payloadB64, 'base64url').toString();
    const decoded = JSON.parse(payloadStr);
    
    // Check expiration
    if (decoded.exp && decoded.exp < Date.now()) {
      return null;
    }
    
    return decoded;
  } catch (e) {
    // Token parsing failed - don't crash
    console.warn('Token verification failed:', e.message);
    return null;
  }
}

/**
 * Extract path and query from request URL
 * Fixed: Safer URL parsing with more fallbacks
 */
function parseUrl(url) {
  const result = {
    path: '/',
    query: {}
  };
  
  // Handle undefined or null URL
  if (!url) {
    return result;
  }
  
  try {
    // Handle full URLs
    let path = url;
    let queryString = '';
    
    const urlObj = new URL(url);
    path = urlObj.pathname;
    queryString = urlObj.search.substring(1);
    
    // Parse query string
    if (queryString) {
      const params = new URLSearchParams(queryString);
      for (const [key, value] of params) {
        result.query[key] = value;
      }
    }
    
    result.path = path;
  } catch (e) {
    // Fallback to simple parsing
    try {
      const parts = url.split('?');
      result.path = parts[0] || '/';
      if (parts[1]) {
        const params = new URLSearchParams(parts[1]);
        for (const [key, value] of params) {
          result.query[key] = value;
        }
      }
    } catch (e2) {
      // Last resort fallback
      console.warn('URL parsing failed, using default:', e2.message);
    }
  }
  
  return result;
}

/**
 * Parse body with safe defaults
 */
function parseBody(body) {
  if (!body) return {};
  
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) || {};
    } catch (e) {
      return {};
    }
  }
  
  if (typeof body === 'object') {
    return body;
  }
  
  return {};
}

/**
 * Main handler
 * Fixed: Comprehensive try-catch wrapper and CommonJS export
 */
async function handler(req, res) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Safely get method and path
    const method = req.method || 'GET';
    const url = req.url || '';
    const { path } = parseUrl(url);

    // Parse body with safe defaults
    let body = {};
    if (method === 'POST' || method === 'PATCH') {
      body = parseBody(req.body);
    }

    // Route requests with error handling per route
    try {
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
    } catch (routeError) {
      console.error('Route handler error:', routeError);
      return res.status(500).json({ error: 'Internal server error in route handler' });
    }
  } catch (error) {
    console.error('Auth API error:', error);
    // Never leave handler without sending a response
    try {
      return res.status(500).json({ error: 'Internal server error' });
    } catch (e) {
      console.error('Failed to send error response:', e);
    }
  }
}

/**
 * Register new user
 * Fixed: Added validation, error handling, and email notification
 */
async function handleRegister(res, body) {
  try {
    const { email, password, name, phone } = body;
    
    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    
    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Demo: Simulate user creation
    const userId = crypto.randomBytes(16).toString('hex');
    const token = generateToken(userId, email);
    
    // Send admin notification for new registration
    sendAdminNotification('register', { name, email, phone }).catch(console.error);
    
    return res.status(201).json({
      success: true,
      user: { id: userId, email, name, phone, tokens: 0 },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
}

/**
 * Login user
 * Fixed: Added validation, error handling, and email notification
 */
async function handleLogin(res, body) {
  try {
    const { email, password } = body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Demo: Simulate login
    const userId = crypto.randomBytes(16).toString('hex');
    const token = generateToken(userId, email);
    
    // Send admin notification for login
    sendAdminNotification('login', { email }).catch(console.error);
    
    return res.status(200).json({
      success: true,
      user: { id: userId, email, name: 'Demo User', tokens: 0 },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
}

/**
 * Get current user profile
 * Fixed: Added safe token handling
 */
async function handleMe(res, headers) {
  try {
    // Safely get authorization header (handle both formats)
    const authHeader = headers?.authorization || headers?.Authorization || '';
    
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
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Failed to get user profile' });
  }
}

// Export for Vercel Serverless (CommonJS)
module.exports = handler;
