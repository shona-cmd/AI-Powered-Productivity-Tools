/**
 * Transactions Module - Client Side
 * Handles transaction history and user dashboard
 */

class TransactionSystem {
    constructor() {
        this.apiBase = '/api';
        this.transactions = [];
        this.stats = null;
    }

    /**
     * Get auth headers
     */
    getHeaders() {
        const token = localStorage.getItem('aiProductivityAuthToken');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    /**
     * Check if authenticated
     */
    isAuthenticated() {
        return !!localStorage.getItem('aiProductivityAuthToken');
    }

    /**
     * Fetch user transactions
     */
    async getTransactions(limit = 50, offset = 0) {
        if (!this.isAuthenticated()) {
            return { success: false, error: 'Please login to view transactions' };
        }

        try {
            const response = await fetch(
                `${this.apiBase}/transactions?limit=${limit}&offset=${offset}`,
                { headers: this.getHeaders() }
            );

            const data = await response.json();

            if (data.success) {
                this.transactions = data.transactions;
                return {
                    success: true,
                    transactions: data.transactions,
                    total: data.total
                };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Get transactions error:', error);
            return { success: false, error: 'Network error' };
        }
    }

    /**
     * Get transaction statistics
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
     */
    async exportTransactions() {
        if (!this.isAuthenticated()) {
            alert('Please login to export transactions');
            return;
        }

        try {
            const response = await fetch(
                `${this.apiBase}/transactions/export`,
                { headers: this.getHeaders() }
            );

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            } else {
                alert('Export failed');
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Export failed');
        }
    }

    /**
     * Format currency
     */
    formatCurrency(amount) {
        return `UGX ${(amount || 0).toLocaleString()}`;
    }

    /**
     * Format date
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
     * Render transactions list
     */
    renderTransactions(containerId = 'transactionsList') {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (this.transactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <h3>No transactions yet</h3>
                    <p>Your purchase history will appear here</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.transactions.map(t => `
            <div class="transaction-item ${t.type}">
                <div class="transaction-icon">
                    ${this.getTransactionIcon(t.type)}
                </div>
                <div class="transaction-details">
                    <div class="transaction-header">
                        <span class="transaction-type">
                            ${t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                        </span>
                        <span class="transaction-date">
                            ${this.formatDate(t.created_at)}
                        </span>
                    </div>
                    <div class="transaction-info">
                        <span class="transaction-tokens">
                            ${t.type === 'usage' ? '-' : '+'}${Math.abs(t.tokens || 0)} 🪙
                        </span>
                        ${t.amount ? `
                            <span class="transaction-amount">
                                ${this.formatCurrency(t.amount)}
                            </span>
                        ` : ''}
                    </div>
                    ${t.description ? `
                        <div class="transaction-description">
                            ${t.description}
                        </div>
                    ` : ''}
                </div>
                <div class="transaction-status ${t.status || 'completed'}">
                    ${t.status || 'completed'}
                </div>
            </div>
        `).join('');
    }

    /**
     * Render stats dashboard
     */
    renderStats(containerId = 'statsDashboard') {
        const container = document.getElementById(containerId);
        if (!container || !this.stats) return;

        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">💰</div>
                    <div class="stat-content">
                        <span class="stat-value">${this.formatCurrency(this.stats.totalSpent)}</span>
                        <span class="stat-label">Total Spent</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🪙</div>
                    <div class="stat-content">
                        <span class="stat-value">${this.stats.totalTokensPurchased || 0}</span>
                        <span class="stat-label">Tokens Purchased</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🎯</div>
                    <div class="stat-content">
                        <span class="stat-value">${this.stats.totalTokensSpent || 0}</span>
                        <span class="stat-label">Tokens Used</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-content">
                        <span class="stat-value">${this.stats.transactionCount || 0}</span>
                        <span class="stat-label">Transactions</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Create dashboard section
     */
    createDashboardSection() {
        const section = document.createElement('div');
        section.id = 'dashboardSection';
        section.className = 'section';
        section.style.display = 'none';
        section.innerHTML = `
            <div class="container">
                <div class="section-header">
                    <span class="section-tag">📊</span>
                    <h2 class="section-title">My <span class="gradient-text">Dashboard</span></h2>
                </div>
                
                <!-- Stats Dashboard -->
                <div id="statsDashboard" class="stats-container">
                    <!-- Stats will be rendered here -->
                </div>
                
                <!-- Transactions -->
                <div class="transactions-section">
                    <div class="transactions-header">
                        <h3>Transaction History</h3>
                        <button class="btn btn-outline" onclick="transactionSystem.exportTransactions()">
                            📥 Export CSV
                        </button>
                    </div>
                    <div id="transactionsList" class="transactions-list">
                        <!-- Transactions will be rendered here -->
                    </div>
                </div>
            </div>
            
            <style>
                .stats-container {
                    margin-bottom: 3rem;
                }
                
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem;
                }
                
                .stat-card {
                    background: white;
                    border-radius: 16px;
                    padding: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                    border: 1px solid #e5e7eb;
                }
                
                .stat-icon {
                    font-size: 2.5rem;
                    background: #f3f4f6;
                    padding: 1rem;
                    border-radius: 12px;
                }
                
                .stat-content {
                    display: flex;
                    flex-direction: column;
                }
                
                .stat-value {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: #1f2937;
                }
                
                .stat-label {
                    font-size: 0.875rem;
                    color: #6b7280;
                }
                
                .transactions-section {
                    background: white;
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                    border: 1px solid #e5e7eb;
                }
                
                .transactions-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid #e5e7eb;
                }
                
                .transactions-header h3 {
                    margin: 0;
                    color: #1f2937;
                }
                
                .transactions-list {
                    max-height: 500px;
                    overflow-y: auto;
                }
                
                .transaction-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                    padding: 1rem;
                    border-radius: 12px;
                    margin-bottom: 0.75rem;
                    background: #f9fafb;
                    transition: all 0.3s ease;
                }
                
                .transaction-item:hover {
                    background: #f3f4f6;
                }
                
                .transaction-icon {
                    font-size: 1.5rem;
                    padding: 0.5rem;
                    background: white;
                    border-radius: 10px;
                }
                
                .transaction-details {
                    flex: 1;
                }
                
                .transaction-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }
                
                .transaction-type {
                    font-weight: 600;
                    color: #1f2937;
                }
                
                .transaction-date {
                    font-size: 0.8rem;
                    color: #6b7280;
                }
                
                .transaction-info {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                }
                
                .transaction-tokens {
                    font-weight: 700;
                    color: #4f46e5;
                }
                
                .transaction-amount {
                    color: #6b7280;
                    font-size: 0.9rem;
                }
                
                .transaction-description {
                    margin-top: 0.5rem;
                    font-size: 0.85rem;
                    color: #6b7280;
                }
                
                .transaction-status {
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                
                .transaction-status.completed {
                    background: #d1fae5;
                    color: #059669;
                }
                
                .transaction-status.pending {
                    background: #fef3c7;
                    color: #d97706;
                }
                
                .transaction-status.failed {
                    background: #fee2e2;
                    color: #dc2626;
                }
                
                .empty-state {
                    text-align: center;
                    padding: 3rem;
                    color: #6b7280;
                }
                
                .empty-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }
                
                .empty-state h3 {
                    color: #1f2937;
                    margin-bottom: 0.5rem;
                }
            </style>
        `;
        
        // Insert after pricing section
        const pricingSection = document.getElementById('pricing');
        if (pricingSection) {
            pricingSection.parentNode.insertBefore(section, pricingSection.nextSibling);
        } else {
            document.body.appendChild(section);
        }
    }

    /**
     * Show dashboard
     */
    async showDashboard() {
        if (!this.isAuthenticated()) {
            alert('Please login to view your dashboard');
            authSystem.openAuthModal('login');
            return;
        }

        const section = document.getElementById('dashboardSection');
        if (!section) {
            this.createDashboardSection();
        }

        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth' });

        // Load data
        await this.getStats();
        await this.getTransactions();
        this.renderStats();
        this.renderTransactions();
    }

    /**
     * Hide dashboard
     */
    hideDashboard() {
        const section = document.getElementById('dashboardSection');
        if (section) {
            section.style.display = 'none';
        }
    }
}

// Initialize
let transactionSystem;
document.addEventListener('DOMContentLoaded', () => {
    transactionSystem = new TransactionSystem();
});

window.transactionSystem = transactionSystem;

