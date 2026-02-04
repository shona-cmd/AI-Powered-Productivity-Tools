/**
 * Mobile Money Payment API for Vercel
 * 
 * This module handles payment verification and token management
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
 * Create a new payment request
 * POST /api/payment/create
 */
async function createPayment(req, body) {
    const { packageId, phoneNumber, method = 'mobile_money' } = body;
    
    // Validate package
    if (!PAYMENT_CONFIG.packages[packageId]) {
        return { status: 400, body: { error: 'Invalid package selected' } };
    }
    
    const pkg = PAYMENT_CONFIG.packages[packageId];
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create payment record
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
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
    };
    
    pendingPayments.set(transactionId, payment);
    
    // Return payment instructions
    return {
        status: 200,
        body: {
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
        }
    };
}

/**
 * Verify a payment
 * POST /api/payment/verify
 */
async function verifyPayment(req, body) {
    const { transactionId, mpesaReference, phoneNumber } = body;
    
    // Find the pending payment
    const payment = pendingPayments.get(transactionId);
    
    if (!payment) {
        return { status: 404, body: { error: 'Transaction not found' } };
    }
    
    // Check if expired
    if (new Date(payment.expiresAt) < new Date()) {
        pendingPayments.delete(transactionId);
        return { status: 400, body: { error: 'Payment session expired. Please start again.' } };
    }
    
    // In production, verify with payment gateway API
    // For demo, we'll simulate verification
    const isVerified = await simulatePaymentVerification(mpesaReference, payment.amount);
    
    if (isVerified) {
        // Mark as completed
        payment.status = 'completed';
        payment.verifiedAt = new Date.toISOString();
        payment.mpesaReference = mpesaReference;
        
        // Move to permanent storage
        transactions.set(transactionId, payment);
        pendingPayments.delete(transactionId);
        
        return {
            status: 200,
            body: {
                success: true,
                transactionId,
                status: 'completed',
                tokens: payment.tokens,
                message: `Successfully credited ${payment.tokens} tokens to your account`
            }
        };
    } else {
        return {
            status: 400,
            body: {
                success: false,
                status: 'pending',
                message: 'Payment not yet received. Please complete the payment and try again.',
                hint: 'If you have sent the payment, wait 1-2 minutes and try verification again.'
            }
        };
    }
}

/**
 * Check payment status
 * GET /api/payment/status?id=...
 */
async function getPaymentStatus(req, query) {
    const { id } = query;
    
    const payment = transactions.get(id) || pendingPayments.get(id);
    
    if (!payment) {
        return { status: 404, body: { error: 'Transaction not found' } };
    }
    
    return {
        status: 200,
        body: {
            transactionId: payment.id,
            status: payment.status,
            amount: payment.amount,
            tokens: payment.tokens,
            createdAt: payment.createdAt
        }
    };
}

/**
 * Get all packages
 * GET /api/packages
 */
async function getPackages(req) {
    return {
        status: 200,
        body: {
            packages: Object.entries(PAYMENT_CONFIG.packages).map(([id, pkg]) => ({
                id,
                ...pkg,
                formattedPrice: `${PAYMENT_CONFIG.currency} ${pkg.price.toLocaleString()}`
            })),
            phoneNumber: PAYMENT_CONFIG.phoneNumber,
            network: PAYMENT_CONFIG.network
        }
    };
}

/**
 * Simulate payment verification
 * In production, replace with actual API call to payment gateway
 */
async function simulatePaymentVerification(reference, amount) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo: Accept any reference that contains "SUCCESS"
    // In production: Call actual payment gateway API
    if (reference && reference.toUpperCase().includes('SUCCESS')) {
        return true;
    }
    
    // Random success for demo (70% chance)
    return Math.random() > 0.3;
}

/**
 * Get transaction history
 * GET /api/transactions?phone=...
 */
async function getTransactions(req, query) {
    const { phone } = query;
    
    const userTransactions = Array.from(transactions.values())
        .filter(t => t.phoneNumber === phone || !phone)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return {
        status: 200,
        body: {
            transactions: userTransactions,
            total: userTransactions.length
        }
    };
}

/**
 * Handle CORS preflight
 */
async function handleOptions() {
    return {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        },
        body: ''
    };
}

/**
 * Main handler for all API requests
 */
async function handler(req, res) {
    const { method, url } = req;
    
    // Handle CORS
    if (method === 'OPTIONS') {
        return handleOptions();
    }
    
    // Parse URL and body
    const [path, queryString] = url.split('?');
    const query = Object.fromEntries(new URLSearchParams(queryString || ''));
    
    let body = {};
    if (method === 'POST') {
        try {
            body = await req.json();
        } catch (e) {
            body = {};
        }
    }
    
    // Route requests
    try {
        let response;
        
        if (path === '/api/payment/create' && method === 'POST') {
            response = await createPayment(req, body);
        } else if (path === '/api/payment/verify' && method === 'POST') {
            response = await verifyPayment(req, body);
        } else if (path === '/api/payment/status' && method === 'GET') {
            response = await getPaymentStatus(req, query);
        } else if (path === '/api/packages' && method === 'GET') {
            response = await getPackages(req);
        } else if (path === '/api/transactions' && method === 'GET') {
            response = await getTransactions(req, query);
        } else if (path === '/api/health' && method === 'GET') {
            response = { status: 200, body: { status: 'ok', timestamp: new Date().toISOString() } };
        } else {
            response = { status: 404, body: { error: 'Endpoint not found' } };
        }
        
        // Send response
        res.status(response.status);
        if (response.headers) {
            Object.entries(response.headers).forEach(([key, value]) => {
                res.setHeader(key, value);
            });
        }
        res.json(response.body);
        
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = handler;

