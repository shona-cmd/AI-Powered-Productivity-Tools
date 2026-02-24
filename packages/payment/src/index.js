/**
 * Payment Module
 * Mobile money payment integration for token purchases
 * 
 * @module @ai-productivity/payment
 */

class PaymentSystem {
    constructor(options = {}) {
        this.phoneNumber = options.phoneNumber || '0761485613';
        this.apiBase = options.apiBase || '/api';
        this.prices = options.prices || {
            '10_tokens': { tokens: 10, price: 10000, label: 'UGX 10,000' },
            '50_tokens': { tokens: 50, price: 40000, label: 'UGX 40,000' },
            '100_tokens': { tokens: 100, price: 70000, label: 'UGX 70,000' },
            '500_tokens': { tokens: 500, price: 300000, label: 'UGX 300,000' }
        };
        this.storage = options.storage || localStorage;
        this.userTokens = this.loadTokens();
        this.currentTransaction = null;
    }

    /**
     * Load token balance from storage
     * @returns {number}
     */
    loadTokens() {
        const saved = this.storage.getItem('aiProductivityTokens');
        return saved ? parseInt(saved) : 0;
    }

    /**
     * Save token balance to storage
     * @param {number} amount - Token amount
     * @returns {number}
     */
    saveTokens(amount) {
        if (this.userTokens + amount < 0) {
            console.error('Insufficient tokens');
            return this.userTokens;
        }
        
        this.userTokens += amount;
        this.storage.setItem('aiProductivityTokens', this.userTokens.toString());
        return this.userTokens;
    }

    /**
     * Get current token balance
     * @returns {number}
     */
    getTokenBalance() {
        return this.userTokens;
    }

    /**
     * Add tokens to user balance
     * @param {number} amount - Amount to add
     * @returns {number}
     */
    addTokens(amount) {
        return this.saveTokens(amount);
    }

    /**
     * Deduct tokens from user balance
     * @param {number} amount - Amount to deduct
     * @returns {boolean}
     */
    deductTokens(amount) {
        if (this.userTokens < amount) {
            return false;
        }
        this.saveTokens(-amount);
        return true;
    }

    /**
     * Load packages from API
     * @returns {Promise<void>}
     */
    async loadPackagesFromAPI() {
        try {
            const response = await fetch(`${this.apiBase}/packages`);
            const data = await response.json();
            if (data.packages) {
                data.packages.forEach(pkg => {
                    if (this.prices[pkg.id]) {
                        this.prices[pkg.id].price = pkg.price;
                        this.prices[pkg.id].label = `${pkg.currency} ${pkg.price.toLocaleString()}`;
                    }
                });
            }
        } catch (error) {
            console.log('Using default package prices');
        }
    }

    /**
     * Get available packages
     * @returns {object}
     */
    getPackages() {
        return this.prices;
    }

    /**
     * Get package by ID
     * @param {string} packageId - Package ID
     * @returns {object|null}
     */
    getPackage(packageId) {
        return this.prices[packageId] || null;
    }

    /**
     * Create payment session
     * @param {string} packageId - Package ID
     * @param {string} phoneNumber - Payer phone number
     * @returns {Promise<object>}
     */
    async createPaymentSession(packageId, phoneNumber) {
        try {
            const response = await fetch(`${this.apiBase}/payment/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packageId, phoneNumber })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.currentTransaction = data.transactionId;
                return { success: true, transactionId: data.transactionId, ...data };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Payment creation error:', error);
            return { success: false, error: 'Failed to create payment session' };
        }
    }

    /**
     * Submit and verify payment (offline mode)
     * @param {string} phone - Payer phone
     * @param {string} transactionRef - Transaction reference
     * @param {string} packageId - Package ID
     * @returns {Promise<object>}
     */
    async submitAndVerifyPayment(phone, transactionRef, packageId) {
        if (!phone || phone.length < 10) {
            return { success: false, error: 'Please enter your mobile number' };
        }

        if (!transactionRef) {
            return { success: false, error: 'Please enter your transaction reference' };
        }

        if (!packageId || !this.prices[packageId]) {
            return { success: false, error: 'Invalid package' };
        }

        const pkg = this.prices[packageId];
        
        // Simulate payment verification (offline mode)
        return new Promise((resolve) => {
            setTimeout(() => {
                // Add tokens
                this.saveTokens(pkg.tokens);

                // Record transaction
                this.recordTransaction({
                    type: 'purchase',
                    tokens: pkg.tokens,
                    amount: pkg.price,
                    description: `Purchased ${pkg.tokens} tokens`,
                    status: 'completed'
                });

                resolve({
                    success: true,
                    tokensAdded: pkg.tokens,
                    newBalance: this.userTokens,
                    message: `${pkg.tokens} tokens added. New balance: ${this.userTokens}`
                });
            }, 2000);
        });
    }

    /**
     * Record transaction
     * @param {object} transactionData - Transaction data
     */
    recordTransaction(transactionData) {
        const userData = this.storage.getItem('aiProductivityUser');
        if (!userData) return;

        const user = JSON.parse(userData);
        const userTransactions = JSON.parse(this.storage.getItem(`transactions_${user.id}`) || '[]');

        const transaction = {
            id: Date.now().toString(),
            ...transactionData,
            created_at: new Date().toISOString(),
            user_id: user.id
        };

        userTransactions.push(transaction);
        this.storage.setItem(`transactions_${user.id}`, JSON.stringify(userTransactions));
    }

    /**
     * Check transaction status
     * @param {string} transactionId - Transaction ID
     * @returns {Promise<object>}
     */
    async checkTransactionStatus(transactionId) {
        // Offline mode - always return completed
        return { success: true, status: 'completed' };
    }

    /**
     * Format currency
     * @param {number} amount - Amount
     * @returns {string}
     */
    formatCurrency(amount) {
        return `UGX ${(amount || 0).toLocaleString()}`;
    }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaymentSystem;
} else if (typeof window !== 'undefined') {
    window.PaymentSystem = PaymentSystem;
}

export default PaymentSystem;
export { PaymentSystem };
