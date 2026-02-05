/**
 * Transactions API for Vercel Serverless
 * 
 * Handles transaction history, reports, and analytics
 */

import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const method = req.method || 'GET';
    const url = req.url || '';
    const [path, queryString] = url.split('?');
    const query = Object.fromEntries(new URLSearchParams(queryString || ''));

    try {
        // Route requests
        if (path === '/api/transactions' && method === 'GET') {
            return handleGetTransactions(res, query, req.headers);
        } else if (path === '/api/transactions/stats' && method === 'GET') {
            return handleGetStats(res, req.headers);
        } else if (path === '/api/transactions/export' && method === 'GET') {
            return handleExportTransactions(res, req.headers);
        } else {
            return res.status(404).json({ error: 'Endpoint not found' });
        }
    } catch (error) {
        console.error('Transactions API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Get all transactions for a user
 * GET /api/transactions
 */
async function handleGetTransactions(res, query, headers) {
    const authHeader = headers.authorization || headers.Authorization;
    
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
}

/**
 * Get transaction statistics
 * GET /api/transactions/stats
 */
async function handleGetStats(res, headers) {
    const authHeader = headers.authorization || headers.Authorization;
    
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
}

/**
 * Export transactions
 * GET /api/transactions/export
 */
async function handleExportTransactions(res, headers) {
    const authHeader = headers.authorization || headers.Authorization;
    
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
}

