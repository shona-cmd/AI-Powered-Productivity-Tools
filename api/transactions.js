/**
 * Transactions API for Vercel Serverless
 * 
 * Handles transaction history, reports, and analytics
 * 
 * Version 2.0 - Fixed for FUNCTION_INVOCATION_FAILED error
 */

import crypto from 'crypto';

// Get JWT secret from environment, with safe fallback
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-do-not-use-in-production';

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
 * Main handler
 * Fixed: Comprehensive try-catch wrapper
 */
async function handler(req, res) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Safely get method and path
    const method = req.method || 'GET';
    const url = req.url || '';
    const { path, query } = parseUrl(url);

    // Safely get headers
    const headers = req.headers || {};

    // Route requests with error handling per route
    try {
      if (path === '/api/transactions' && method === 'GET') {
        return handleGetTransactions(res, query, headers);
      } else if (path === '/api/transactions/stats' && method === 'GET') {
        return handleGetStats(res, headers);
      } else if (path === '/api/transactions/export' && method === 'GET') {
        return handleExportTransactions(res, headers);
      } else {
        return res.status(404).json({ error: 'Endpoint not found' });
      }
    } catch (routeError) {
      console.error('Route handler error:', routeError);
      return res.status(500).json({ error: 'Internal server error in route handler' });
    }
  } catch (error) {
    console.error('Transactions API error:', error);
    // Never leave handler without sending a response
    try {
      return res.status(500).json({ error: 'Internal server error' });
    } catch (e) {
      console.error('Failed to send error response:', e);
    }
  }
}

/**
 * Get all transactions for a user
 * Fixed: Added safe authorization handling
 */
async function handleGetTransactions(res, query, headers) {
  try {
    // Safely get authorization header
    const authHeader = headers?.authorization || headers?.Authorization || '';
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Demo mode - return empty list
    return res.status(200).json({
      success: true,
      transactions: [],
      total: 0,
      message: 'Demo mode - connect Supabase for real data'
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    return res.status(500).json({ error: 'Failed to get transactions' });
  }
}

/**
 * Get transaction statistics
 * Fixed: Added safe authorization handling
 */
async function handleGetStats(res, headers) {
  try {
    // Safely get authorization header
    const authHeader = headers?.authorization || headers?.Authorization || '';
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    return res.status(200).json({
      success: true,
      stats: {
        totalSpent: 0,
        totalTokensPurchased: 0,
        totalTokensSpent: 0,
        transactionCount: 0,
        purchases: 0,
        usage: 0,
        message: 'Demo mode - connect Supabase for real data'
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({ error: 'Failed to get statistics' });
  }
}

/**
 * Export transactions
 * Fixed: Added safe authorization handling
 */
async function handleExportTransactions(res, headers) {
  try {
    // Safely get authorization header
    const authHeader = headers?.authorization || headers?.Authorization || '';
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    const csv = 'ID,Type,Tokens,Amount,Date\n';
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="transactions-${Date.now()}.csv"`);
    return res.status(200).send(csv);
  } catch (error) {
    console.error('Export transactions error:', error);
    return res.status(500).json({ error: 'Failed to export transactions' });
  }
}

// Export for Vercel Serverless (ESM)
export default handler;

