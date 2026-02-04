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
 */

// In-memory transaction storage (use database in production)
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
 * Main handler for all API requests
 * Compatible with Vercel Serverless Functions
 */
module.exports = async (req, res) => {
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

    // Parse body
    let body = {};
    if (method === 'POST') {
        try {
            body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
        } catch (e) {
            body = {};
        }
    }

    try {
        // Route requests
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
        } else if (path === '/api/health' && method === 'GET') {
            return res.status(200).json({
                status: 'ok',
                timestamp: new Date().toISOString()
            });
        } else {
            return res.status(404).json({ error: 'Endpoint not found', path, method });
        }
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Create a new payment request
 * POST /api/payment/create
 */
async function handleCreatePayment(res, body) {
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
}

/**
 * Verify a payment
 * POST /api/payment/verify
 */
async function handleVerifyPayment(res, body) {
    const { transactionId, mpesaReference, phoneNumber } = body;
    
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
        return res.status(400).json({
            success: false,
            status: 'pending',
            message: 'Payment not yet received. Please complete the payment and try again.',
            hint: 'If you have sent the payment, wait 1-2 minutes and try verification again.'
        });
    }
}

/**
 * Check payment status
 * GET /api/payment/status?id=...
 */
async function handleGetPaymentStatus(res, query) {
    const { id } = query;
    
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
}

/**
 * Get all packages
 * GET /api/packages
 */
async function handleGetPackages(res) {
    return res.status(200).json({
        packages: Object.entries(PAYMENT_CONFIG.packages).map(([id, pkg]) => ({
            id,
            ...pkg,
            formattedPrice: `${PAYMENT_CONFIG.currency} ${pkg.price.toLocaleString()}`
        })),
        phoneNumber: PAYMENT_CONFIG.phoneNumber,
        network: PAYMENT_CONFIG.network
    });
}

/**
 * Simulate payment verification
 * In production, replace with actual API call to payment gateway
 */
async function simulatePaymentVerification(reference, amount) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (reference && reference.toUpperCase().includes('SUCCESS')) {
        return true;
    }
    
    return Math.random() > 0.3;
}

/**
 * Get transaction history
 * GET /api/transactions?phone=...
 */
async function handleGetTransactions(res, query) {
    const { phone } = query;
    
    const userTransactions = Array.from(transactions.values())
        .filter(t => t.phoneNumber === phone || !phone)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return res.status(200).json({
        transactions: userTransactions,
        total: userTransactions.length
    });
}

