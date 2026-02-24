/**
 * Transaction Module
 * Handles transaction history and user dashboard
 * 
 * @module @ai-productivity/transactions
 */

class TransactionSystem {
    constructor(options = {}) {
        this.apiBase = options.apiBase || '/api';
        this.storage = options.storage || localStorage;
        this.transactions = [];
        this.stats = null;
    }

    /**
     * Get auth headers
     * @returns {object}
     */
    getHeaders() {
        const token = this.storage.getItem('aiProductivityAuthToken');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    /**
     * Check if authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!this.storage.getItem('aiProductivityAuthToken');
    }

    /**
     * Fetch user transactions (Offline mode)
     * @param {number} limit - Max transactions to fetch
     * @param {number} offset - Offset for pagination
     * @returns {Promise<object>}
     */
    async getTransactions(limit = 50, offset = 0) {
        if (!this.isAuthenticated()) {
            return { success: false, error: 'Please login to view transactions' };
        }

        const userData = this.storage.getItem('aiProductivityUser');
        if (!userData) return { success: false, error: 'User not found' };

        const user = JSON.parse(userData);
        const userTransactions = JSON.parse(this.storage.getItem(`transactions_${user.id}`) || '[]');

        // Sort by date descending
        userTransactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Apply pagination
        const paginatedTransactions = userTransactions.slice(offset, offset + limit);

        this.transactions = paginatedTransactions;
        return {
            success: true,
            transactions: paginatedTransactions,
            total: userTransactions.length
        };
    }

    /**
     * Get transaction statistics
     * @returns {Promise<object>}
     */
    async getStats() {
        if (!this.isAuthenticated()) {
            return { success: false, error: 'Please login' };
        }

        try {
            const response = await fetch(
                `${this.apiBase}/transactions/stats`,
                { headers: this.getHeaders() }
            );

            const data = await response.json();

            if (data.success) {
                this.stats = data.stats;
                return { success: true, stats: data.stats };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Get stats error:', error);
            return { success: false, error: 'Network error' };
        }
    }

    /**
     * Export transactions to CSV
     * @returns {Promise<void>}
     */
    async exportTransactions() {
        if (!this.isAuthenticated()) {
            throw new Error('Please login to export transactions');
        }

        const userData = this.storage.getItem('aiProductivityUser');
        if (!userData) {
            throw new Error('User not found');
        }

        const user = JSON.parse(userData);
        const userTransactions = JSON.parse(this.storage.getItem(`transactions_${user.id}`) || '[]');

        if (userTransactions.length === 0) {
            throw new Error('No transactions to export');
        }

        // Create CSV content
        const headers = ['Date', 'Type', 'Description', 'Tokens', 'Amount', 'Status'];
        const csvContent = [
            headers.join(','),
            ...userTransactions.map(t => [
                t.created_at,
                t.type,
                t.description || '',
                t.tokens || 0,
                t.amount || 0,
                t.status || 'completed'
            ].join(','))
        ].join('\n');

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    /**
     * Format currency
     * @param {number} amount - Amount
     * @returns {string}
     */
    formatCurrency(amount) {
        return `UGX ${(amount || 0).toLocaleString()}`;
    }

    /**
     * Format date
     * @param {string} dateString - Date string
     * @returns {string}
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-UG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Get transaction icon
     * @param {string} type - Transaction type
     * @returns {string}
     */
    getTransactionIcon(type) {
        const icons = {
            purchase: '💳',
            usage: '🎯',
            bonus: '🎁',
            refund: '↩️'
        };
        return icons[type] || '📊';
    }

    /**
     * Get transaction type label
     * @param {string} type - Transaction type
     * @returns {string}
     */
    getTransactionTypeLabel(type) {
        return type.charAt(0).toUpperCase() + type.slice(1);
    }

    /**
     * Get status class
     * @param {string} status - Transaction status
     * @returns {string}
     */
    getStatusClass(status) {
        return status || 'completed';
    }

    /**
     * Get transactions as array
     * @returns {array}
     */
    getTransactionsArray() {
        return this.transactions;
    }

    /**
     * Get stats
     * @returns {object|null}
     */
    getStatsData() {
        return this.stats;
    }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TransactionSystem;
} else if (typeof window !== 'undefined') {
    window.TransactionSystem = TransactionSystem;
}

export default TransactionSystem;
export { TransactionSystem };
