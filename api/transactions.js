/**
 * Transactions API for Vercel Serverless
 * 
 * Handles transaction history, reports, and analytics
 */

const crypto = require('crypto');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'your-service-key';
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
 * Get all transactions for a user
 * GET /api/transactions
 */
async function getTransactions(req, res) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    
    const { limit = 50, offset = 0, type = null } = req.query;
    
    try {
        let endpoint = `/transactions?user_id=eq.${decoded.userId}&order=created_at.desc&limit=${limit}&offset=${offset}`;
        
        if (type) {
            endpoint += `&type=eq.${type}`;
        }
        
        const response = await supabaseRequest('GET', endpoint);
        const transactions = await response.json();
        
        // Get total count
        const countResponse = await supabaseRequest('GET', `/transactions?user_id=eq.${decoded.userId}&select=id`);
        const allTransactions = await countResponse.json();
        
        res.json({
            success: true,
            transactions,
            total: allTransactions.length,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
        
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
}

/**
 * Get single transaction
 * GET /api/transactions/:id
 */
async function getTransaction(req, res) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    
    const { id } = req.params;
    
    try {
        const response = await supabaseRequest('GET', `/transactions?id=eq.${id}&user_id=eq.${decoded.userId}`);
        const transactions = await response.json();
        
        if (transactions.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        
        res.json({
            success: true,
            transaction: transactions[0]
        });
        
    } catch (error) {
        console.error('Get transaction error:', error);
        res.status(500).json({ error: 'Failed to fetch transaction' });
    }
}

/**
 * Create new transaction (used by payment API)
 * POST /api/transactions
 */
async function createTransaction(data) {
    try {
        const response = await supabaseRequest('POST', '/transactions', {
            ...data,
            created_at: new Date().toISOString()
        });
        
        return response.ok;
    } catch (error) {
        console.error('Create transaction error:', error);
        return false;
    }
}

/**
 * Get transaction statistics
 * GET /api/transactions/stats
 */
async function getStats(req, res) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    
    try {
        // Get all user transactions
        const response = await supabaseRequest('GET', `/transactions?user_id=eq.${decoded.userId}`);
        const transactions = await response.json();
        
        // Calculate statistics
        const stats = {
            totalSpent: 0,
            totalTokensPurchased: 0,
            totalTokensSpent: 0,
            transactionCount: transactions.length,
            purchases: 0,
            usage: 0,
            lastTransaction: null,
            monthlySpending: {},
            recentActivity: []
        };
        
        transactions.forEach(t => {
            if (t.type === 'purchase') {
                stats.totalSpent += t.amount || 0;
                stats.totalTokensPurchased += t.tokens || 0;
                stats.purchases++;
            } else if (t.type === 'usage') {
                stats.totalTokensSpent += Math.abs(t.tokens || 0);
                stats.usage++;
            }
            
            // Monthly breakdown
            const month = new Date(t.created_at).toLocaleString('default', { 
                year: 'numeric', 
                month: 'short' 
            });
            if (t.type === 'purchase') {
                stats.monthlySpending[month] = (stats.monthlySpending[month] || 0) + (t.amount || 0);
            }
        });
        
        // Last transaction
        if (transactions.length > 0) {
            stats.lastTransaction = transactions[0];
        }
        
        // Recent activity (last 5)
        stats.recentActivity = transactions.slice(0, 5);
        
        res.json({
            success: true,
            stats
        });
        
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
}

/**
 * Export transactions
 * GET /api/transactions/export
 */
async function exportTransactions(req, res) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    
    try {
        const response = await supabaseRequest('GET', `/transactions?user_id=eq.${decoded.userId}&order=created_at.desc`);
        const transactions = await response.json();
        
        // Generate CSV
        const headers = ['ID', 'Type', 'Tokens', 'Amount', 'Description', 'Date', 'Status'];
        const rows = transactions.map(t => [
            t.id,
            t.type,
            t.tokens,
            t.amount || 0,
            t.description || '',
            new Date(t.created_at).toISOString(),
            t.status || 'completed'
        ]);
        
        const csv = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="transactions-${Date.now()}.csv"`);
        res.send(csv);
        
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Failed to export transactions' });
    }
}

/**
 * Handle CORS
 */
function handleCors(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    
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
    const [path, queryString] = url.split('?');
    const query = Object.fromEntries(new URLSearchParams(queryString || ''));
    
    // Parse body for POST
    let body = {};
    if (method === 'POST') {
        try {
            body = await req.json();
        } catch (e) {}
    }
    
    req.query = query;
    req.body = body;
    
    try {
        let response;
        
        if (path === '/api/transactions' && method === 'GET') {
            response = await getTransactions(req, res);
        } else if (path.startsWith('/api/transactions/') && method === 'GET') {
            req.params = { id: path.split('/').pop() };
            response = await getTransaction(req, res);
        } else if (path === '/api/transactions/stats' && method === 'GET') {
            response = await getStats(req, res);
        } else if (path === '/api/transactions/export' && method === 'GET') {
            response = await exportTransactions(req, res);
        } else {
            response = { status: 404, body: { error: 'Endpoint not found' } };
        }
        
        if (!response.body) return;
        res.status(response.status);
        res.json(response.body);
        
    } catch (error) {
        console.error('Transactions API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = handler;
module.exports.createTransaction = createTransaction;

