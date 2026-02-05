/**
 * Mobile Money Payment API for Vercel Serverless
 * 
 * Handles payment verification and token management
 * for the AI Productivity Tools mobile money payment system.
 * 
 * IMPORTANT: This is a demo implementation. For production:
 * - Use a real payment gateway API (M-Pesa, Airtel Money, etc.)
 * - Store transactions in a database (PostgreSQL, MongoDB, etc.)
 * - Implement proper webhook verification
 * 
 * Version 3.0 - Fixed: FUNCTION_INVOCATION_FAILED
 * Changed to CommonJS exports for consistent serverless behavior
 * Removed setInterval to prevent runtime crashes
 * 
 * @vercel { runtime: "nodejs18.x" }
 */

// Using CommonJS for consistent Vercel serverless behavior
const crypto = require('crypto');

// In-memory transaction storage (use database in production)
// Fixed: Use Map with on-demand cleanup (no setInterval)
const transactions = new Map();
const pendingPayments = new Map();

// Payment configuration
const PAYMENT_CONFIG = {
    phoneNumber: process.env.MOBILE_MONEY_PHONE || '0761485613',
    network: process.env.MOBILE_MONEY_NETWORK || 'MTN',
    currency: 'UGX',
    packages: {
        '10_tokens': { tokens: 10, price: 10000 },
        '50_tokens': { tokens: 50, price: 40000 },
        '100_tokens': { tokens: 100, price: 70000 },
        '500_tokens': { tokens: 500, price: 300000 }
    }
};

/**
 * Cleanup expired payments on-demand
 * Fixed: No setInterval - use on-demand cleanup instead
 * This function only runs when needed, not continuously
 */
function cleanupExpiredPayments() {
    try {
        const now = new Date();
        const expiredIds = [];
        
        for (const [id, payment] of pendingPayments) {
            if (new Date(payment.expiresAt) < now) {
                expiredIds.push(id);
            }
        }
        
        // Remove expired payments
        expiredIds.forEach(id => pendingPayments.delete(id));
        
        // Limit total storage to prevent memory leaks
        if (pendingPayments.size > 100) {
            const oldest = Array.from(pendingPayments.entries())
                .sort((a, b) => new Date(a[1].createdAt) - new Date(b[1].createdAt))
                .slice(0, pendingPayments.size - 100);
            oldest.forEach(([id]) => pendingPayments.delete(id));
        }
        
        // Also cleanup old completed transactions
        if (transactions.size > 50) {
            const oldest = Array.from(transactions.entries())
                .sort((a, b) => new Date(a[1].createdAt) - new Date(b[1].createdAt))
                .slice(0, transactions.size - 50);
            oldest.forEach(([id]) => transactions.delete(id));
        }
    } catch (e) {
        console.warn('Cleanup failed:', e.message);
    }
}

/**
 * Extract path and query from request URL
 * Fixed: Handles different URL formats from Vercel Serverless
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
        // Handle full URLs (e.g., https://domain.com/api/path?query=1)
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
        // Fallback to simple split
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
            console.warn('URL parsing failed, using default:', e2.message);
        }
    }
    
    return result;
}

/**
 * Safe JSON body parsing
 * Fixed: Prevent crashes from malformed JSON
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
 * Main handler for all API requests
 * Compatible with Vercel Serverless Functions
 * Fixed: Comprehensive error handling and CommonJS export
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

        // Safely get method and URL
        const method = req.method || 'GET';
        const url = req.url || '';
        const { path, query } = parseUrl(url);

        // Parse body safely
        let body = {};
        if (method === 'POST') {
            body = parseBody(req.body);
        }

        // Route requests with error handling
        try {
            if (path === '/api/payment/create' && method === 'POST') {
                return handleCreatePayment(res, body);
            } else if (path === '/api/payment/verify' && method === 'POST') {
                return handleVerifyPayment(res, body);
            } else if (path === '/api/payment/status' && method === 'GET') {
                return handleGetPaymentStatus(res, query);
            } else if (path === '/api/packages' && method === 'GET') {
                return handleGetPackages(res);
            } else if (path === '/api/transactions' && method === 'GET') {
                return handleGetTransactions(res, query);
            } else {
                return res.status(404).json({ error: 'Endpoint not found', path, method });
            }
        } catch (routeError) {
            console.error('Route handler error:', routeError);
            return res.status(500).json({ error: 'Internal server error in route handler' });
        }
    } catch (error) {
        console.error('API Error:', error);
        // Never leave handler without sending a response
        try {
            return res.status(500).json({ error: 'Internal server error' });
        } catch (e) {
            console.error('Failed to send error response:', e);
        }
    }
}

/**
 * Create a new payment request
 * POST /api/payment/create
 */
async function handleCreatePayment(res, body) {
    try {
        const { packageId, phoneNumber, method = 'mobile_money' } = body;
        
        if (!PAYMENT_CONFIG.packages[packageId]) {
            return res.status(400).json({ error: 'Invalid package selected' });
        }
        
        const pkg = PAYMENT_CONFIG.packages[packageId];
        const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const payment = {
            id: transactionId,
            packageId,
            tokens: pkg.tokens,
            amount: pkg.price,
            currency: PAYMENT_CONFIG.currency,
            phoneNumber: phoneNumber || PAYMENT_CONFIG.phoneNumber,
            method,
            status: 'pending',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
        };
        
        pendingPayments.set(transactionId, payment);
        
        return res.status(200).json({
            success: true,
            transactionId,
            instructions: {
                step1: `Send UGX ${pkg.price.toLocaleString()} to ${PAYMENT_CONFIG.phoneNumber} (${PAYMENT_CONFIG.network})`,
                step2: 'Use your mobile money PIN to confirm',
                step3: 'Enter the transaction reference below for verification',
                step4: 'Your tokens will be credited after confirmation'
            },
            paymentDetails: {
                recipient: PAYMENT_CONFIG.phoneNumber,
                network: PAYMENT_CONFIG.network,
                amount: pkg.price,
                currency: PAYMENT_CONFIG.currency,
                reference: transactionId
            },
            expiresIn: '30 minutes'
        });
    } catch (error) {
        console.error('Create payment error:', error);
        return res.status(500).json({ error: 'Failed to create payment' });
    }
}

/**
 * Verify a payment
 * POST /api/payment/verify
 */
async function handleVerifyPayment(res, body) {
    try {
        const { transactionId, mpesaReference, phoneNumber } = body;
        
        if (!transactionId) {
            return res.status(400).json({ error: 'Transaction ID is required' });
        }
        
        const payment = pendingPayments.get(transactionId);
        
        if (!payment) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        
        if (new Date(payment.expiresAt) < new Date()) {
            pendingPayments.delete(transactionId);
            return res.status(400).json({ error: 'Payment session expired. Please start again.' });
        }
        
        const isVerified = await simulatePaymentVerification(mpesaReference, payment.amount);
        
        if (isVerified) {
            payment.status = 'completed';
            payment.verifiedAt = new Date().toISOString();
            payment.mpesaReference = mpesaReference;
            
            transactions.set(transactionId, payment);
            pendingPayments.delete(transactionId);
            
            return res.status(200).json({
                success: true,
                transactionId,
                status: 'completed',
                tokens: payment.tokens,
                message: `Successfully credited ${payment.tokens} tokens to your account`
            });
        } else {
            return res.status(200).json({
                success: false,
                status: 'pending',
                message: 'Payment not yet received. Please complete the payment and try again.',
                hint: 'If you have sent the payment, wait 1-2 minutes and try verification again.'
            });
        }
    } catch (error) {
        console.error('Verify payment error:', error);
        return res.status(500).json({ error: 'Failed to verify payment' });
    }
}

/**
 * Check payment status
 * GET /api/payment/status?id=...
 */
async function handleGetPaymentStatus(res, query) {
    try {
        const { id } = query;
        
        if (!id) {
            return res.status(400).json({ error: 'Transaction ID is required' });
        }
        
        const payment = transactions.get(id) || pendingPayments.get(id);
        
        if (!payment) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        
        return res.status(200).json({
            transactionId: payment.id,
            status: payment.status,
            amount: payment.amount,
            tokens: payment.tokens,
            createdAt: payment.createdAt
        });
    } catch (error) {
        console.error('Get payment status error:', error);
        return res.status(500).json({ error: 'Failed to get payment status' });
    }
}

/**
 * Get all packages
 * GET /api/packages
 */
async function handleGetPackages(res) {
    try {
        return res.status(200).json({
            packages: Object.entries(PAYMENT_CONFIG.packages).map(([id, pkg]) => ({
                id,
                ...pkg,
                formattedPrice: `${PAYMENT_CONFIG.currency} ${pkg.price.toLocaleString()}`
            })),
            phoneNumber: PAYMENT_CONFIG.phoneNumber,
            network: PAYMENT_CONFIG.network
        });
    } catch (error) {
        console.error('Get packages error:', error);
        return res.status(500).json({ error: 'Failed to get packages' });
    }
}

/**
 * Simulate payment verification
 * In production, replace with actual API call to payment gateway
 */
async function simulatePaymentVerification(reference, amount) {
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (reference && reference.toUpperCase().includes('SUCCESS')) {
            return true;
        }
        
        return Math.random() > 0.3;
    } catch (error) {
        console.error('Payment simulation error:', error);
        return false;
    }
}

/**
 * Get transaction history
 * GET /api/transactions?phone=...
 * Fixed: Added on-demand cleanup
 */
async function handleGetTransactions(res, query) {
    try {
        const { phone } = query;
        
        // Run on-demand cleanup
        cleanupExpiredPayments();
        
        const userTransactions = Array.from(transactions.values())
            .filter(t => t.phoneNumber === phone || !phone)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        return res.status(200).json({
            transactions: userTransactions,
            total: userTransactions.length
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        return res.status(500).json({ error: 'Failed to get transactions' });
    }
}

// Export for Vercel Serverless (CommonJS)
module.exports = handler;

