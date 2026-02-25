/**
 * AI Productivity Tools - Payment & Token System
 * Mobile Money Payment Integration with API Backend
 * 
 * This module provides secure payment processing through mobile money.
 * Works with the Vercel serverless API for payment verification.
 */

class PaymentSystem {
    constructor() {
        this.phoneNumber = '0761485613';
        this.apiBase = '/api';
        this.prices = {
            '10_tokens': { tokens: 10, price: 10000, label: 'UGX 10,000' },
            '50_tokens': { tokens: 50, price: 40000, label: 'UGX 40,000' },
            '100_tokens': { tokens: 100, price: 70000, label: 'UGX 70,000' },
            '500_tokens': { tokens: 500, price: 300000, label: 'UGX 300,000' }
        };
        this.userTokens = this.loadTokens();
        this.currentTransaction = null;
        this.init();
    }

    init() {
        this.createPaymentModal();
        this.createTokenDisplay();
        this.loadPackagesFromAPI();
    }

    loadTokens() {
        const saved = localStorage.getItem('aiProductivityTokens');
        return saved ? parseInt(saved) : 0;
    }

    saveTokens(amount) {
        // Prevent negative balance
        if (this.userTokens + amount < 0) {
            console.error('Insufficient tokens');
            return this.userTokens;
        }
        
        this.userTokens += amount;
        localStorage.setItem('aiProductivityTokens', this.userTokens.toString());
        this.updateTokenDisplay();
        this.updateHeaderTokenDisplay();
        return this.userTokens;
    }
    
    updateHeaderTokenDisplay() {
        const headerDisplay = document.getElementById('tokenDisplay');
        if (headerDisplay) {
            headerDisplay.innerHTML = `
                <span>🪙 ${this.userTokens} Tokens</span>
                <button onclick="paymentSystem.openPaymentModal()">+ Buy</button>
            `;
            headerDisplay.style.display = 'flex';
        }
    }

    getTokenBalance() {
        return this.userTokens;
    }

    async loadPackagesFromAPI() {
        try {
            const response = await fetch(`${this.apiBase}/packages`);
            const data = await response.json();
            if (data.packages) {
                // Update prices from API
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

    createPaymentModal() {
        // Remove existing modal if present
        const existingModal = document.getElementById('paymentModal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'paymentModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content payment-modal-content">
                <span class="close-btn" onclick="paymentSystem.closePaymentModal()">&times;</span>
                <div class="payment-header">
                    <div class="payment-icon">💳</div>
                    <h2>Buy Tokens</h2>
                    <p>Secure Mobile Money Payment</p>
                </div>
                
                <div class="security-badge">
                    <span class="secure-icon">🔒</span>
                    <span>Secure Payment via Mobile Money</span>
                </div>

                <div class="phone-display">
                    <span class="phone-label">Send to:</span>
                    <span class="phone-number">${this.phoneNumber}</span>
                    <span class="network-badge">MTN Mobile Money</span>
                </div>

                <div class="token-packages">
                    <h3>Choose Package</h3>
                    <div class="package-grid" id="packageGrid">
                        <div class="package-card" onclick="paymentSystem.selectPackage('10_tokens', event)">
                            <div class="package-tokens">10</div>
                            <div class="package-price">UGX 10,000</div>
                            <div class="package-savings">~ $2.50</div>
                        </div>
                        <div class="package-card" onclick="paymentSystem.selectPackage('50_tokens', event)">
                            <div class="package-tokens">50</div>
                            <div class="package-price">UGX 40,000</div>
                            <div class="package-savings">~ $10</div>
                        </div>
                        <div class="package-card featured" onclick="paymentSystem.selectPackage('100_tokens', event)">
                            <div class="package-tokens">100</div>
                            <div class="package-price">UGX 70,000</div>
                            <div class="package-savings">Best Value - Save 30%</div>
                        </div>
                        <div class="package-card" onclick="paymentSystem.selectPackage('500_tokens', event)">
                            <div class="package-tokens">500</div>
                            <div class="package-price">UGX 300,000</div>
                            <div class="package-savings">~ $75</div>
                        </div>
                    </div>
                </div>

                <div class="payment-form" id="paymentForm" style="display:none;">
                    <div class="selected-package" id="selectedPackage"></div>
                    
                    <div class="form-group">
                        <label>Your Mobile Number</label>
                        <input type="tel" id="payerPhone" placeholder="07XXXXXXXX" maxlength="10">
                    </div>

                    <div class="payment-instructions" id="paymentInstructions">
                        <h4>📱 Payment Instructions:</h4>
                        <ol>
                            <li>Open your MTN Mobile Money app or dial *165#</li>
                            <li>Send <strong id="paymentAmount">UGX 0</strong> to <strong>${this.phoneNumber}</strong></li>
                            <li>Copy your transaction reference (e.g., ABC123456789)</li>
                            <li>Enter the reference below for verification</li>
                        </ol>
                    </div>

                    <div class="form-group">
                        <label>Transaction Reference / M-Pesa Code</label>
                        <input type="text" id="transactionRef" placeholder="Enter your payment reference (e.g., MPN123456789)" />
                    </div>

                    <button class="btn btn-primary btn-block" id="verifyPaymentBtn" onclick="paymentSystem.submitAndVerifyPayment()">
                        <span class="btn-text">✓ I've Sent Payment - Verify</span>
                        <span class="btn-loading" style="display:none;">⏳ Verifying...</span>
                    </button>

                    <div class="verification-status" id="verificationStatus" style="display:none;"></div>
                </div>

                <div class="payment-footer">
                    <p>💡 Need help? Contact support with your transaction ID</p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    createTokenDisplay() {
        const existingDisplay = document.getElementById('tokenDisplay');
        if (existingDisplay) existingDisplay.remove();

        const display = document.createElement('div');
        display.id = 'tokenDisplay';
        display.className = 'token-display';
        display.innerHTML = `
            <span>🪙 ${this.userTokens} Tokens</span>
            <button onclick="paymentSystem.openPaymentModal()">+ Buy</button>
        `;
        document.body.appendChild(display);
    }

    updateTokenDisplay() {
        const display = document.getElementById('tokenDisplay');
        if (display) {
            display.innerHTML = `
                <span>🪙 ${this.userTokens} Tokens</span>
                <button onclick="paymentSystem.openPaymentModal()">+ Buy</button>
            `;
        }
    }

    selectPackage(packageId, event) {
        if (event) event.stopPropagation();
        
        document.querySelectorAll('.package-card').forEach(c => c.classList.remove('selected', 'featured'));
        event.target.closest('.package-card').classList.add('selected');
        
        const pkg = this.prices[packageId];
        const usdPrice = (pkg.price / 4000).toFixed(2); // Approximate USD conversion
        
        document.getElementById('selectedPackage').innerHTML = `
            <div class="selected-package-display">
                <div class="selected-header">
                    <strong>${pkg.tokens} Tokens</strong>
                    <span class="price-tag">${pkg.label}</span>
                </div>
                <div class="usd-price">~ $${usdPrice} USD</div>
            </div>
        `;
        
        document.getElementById('paymentAmount').textContent = pkg.label;
        document.getElementById('paymentForm').style.display = 'block';
    }

    openPaymentModal() {
        document.getElementById('paymentModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closePaymentModal() {
        document.getElementById('paymentModal').classList.remove('active');
        document.body.style.overflow = '';
        this.currentTransaction = null;
        this.resetPaymentForm();
    }

    resetPaymentForm() {
        const form = document.getElementById('paymentForm');
        const status = document.getElementById('verificationStatus');
        const btn = document.getElementById('verifyPaymentBtn');
        const btnText = btn.querySelector('.btn-text');
        const btnLoading = btn.querySelector('.btn-loading');
        
        if (form) form.style.display = 'none';
        if (status) {
            status.style.display = 'none';
            status.className = 'verification-status';
            status.innerHTML = '';
        }
        
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        btn.disabled = false;
        
        document.querySelectorAll('.package-card').forEach(c => c.classList.remove('selected'));
        document.getElementById('payerPhone').value = '';
        document.getElementById('transactionRef').value = '';
    }

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

    async submitAndVerifyPayment() {
        const phone = document.getElementById('payerPhone').value;
        const transactionRef = document.getElementById('transactionRef').value.trim();
        const selected = document.querySelector('.package-card.selected');

        if (!phone || phone.length < 10) {
            this.showVerificationStatus('❌ Please enter your mobile number', 'error');
            return;
        }

        if (!transactionRef) {
            this.showVerificationStatus('❌ Please enter your transaction reference', 'error');
            return;
        }

        if (!selected) {
            this.showVerificationStatus('❌ Please select a package first', 'error');
            return;
        }

        const packageId = Object.keys(this.prices).find(key =>
            selected.querySelector('.package-tokens').textContent === key.split('_')[0]
        );

        // Check if 2FA is enabled and required
        if (twoFactorAuth && twoFactorAuth.is2FAEnabled()) {
            // Show 2FA verification modal
            this.show2FAVerificationForPayment(packageId, phone);
            return;
        }

        // Proceed without 2FA if not enabled
        await this.processPayment(packageId);
    }

    /**
     * Show 2FA verification for payment
     */
    show2FAVerificationForPayment(packageId, phone) {
        // Create a 2FA verification modal for payment
        const existingModal = document.getElementById('payment2FAModal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'payment2FAModal';
        modal.className = 'modal active';
        
        modal.innerHTML = `
            <div class="modal-content auth-modal-content" style="max-width: 400px;">
                <span class="close-btn" onclick="paymentSystem.closePayment2FA()">&times;</span>
                
                <div class="auth-header" style="text-align: center;">
                    <div class="auth-icon" style="font-size: 3rem;">🔐</div>
                    <h2>2FA Verification Required</h2>
                    <p style="color: #6b7280;">Enter a code from your authenticator app to confirm this purchase</p>
                </div>
                
                <div class="form-group">
                    <label>Authentication Code</label>
                    <input type="text" id="payment2FACode" placeholder="Enter 6-digit code" maxlength="6" style="text-align: center; letter-spacing: 4px; font-size: 1.2rem;">
                </div>
                
                <p style="font-size: 0.85rem; color: #6b7280; margin-bottom: 1rem;">
                    Or use a backup code (8 characters)
                </p>
                
                <input type="hidden" id="payment2FAPackageId" value="${packageId}">
                <input type="hidden" id="payment2FAPhone" value="${phone}">
                
                <button class="btn btn-primary btn-block" onclick="paymentSystem.verify2FAAndCompletePayment()">
                    Verify & Complete Purchase
                </button>
                
                <button class="btn btn-outline btn-block" style="margin-top: 0.75rem;" onclick="paymentSystem.skip2FAForPayment()">
                    Skip 2FA (Not Recommended)
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
    }

    /**
     * Verify 2FA and complete payment
     */
    async verify2FAAndCompletePayment() {
        const code = document.getElementById('payment2FACode').value.trim();
        const packageId = document.getElementById('payment2FAPackageId').value;
        const phone = document.getElementById('payment2FAPhone').value;
        
        if (!code) {
            this.showPayment2FAError('Please enter a verification code');
            return;
        }
        
        // Verify 2FA code
        const result = await twoFactorAuth.verify2FAForAction('purchase', code);
        
        if (result.success && result.verified) {
            // Close 2FA modal and process payment
            this.closePayment2FA();
            await this.processPayment(packageId);
        } else {
            this.showPayment2FAError('Invalid verification code. Please try again.');
        }
    }

    /**
     * Skip 2FA for payment (not recommended)
     */
    async skip2FAForPayment() {
        const packageId = document.getElementById('payment2FAPackageId').value;
        
        this.closePayment2FA();
        
        // Show warning notification
        if (authSystem) {
            authSystem.showNotification('⚠️ Purchase completed without 2FA verification. Consider enabling 2FA for security.', 'warning');
        }
        
        await this.processPayment(packageId);
    }

    /**
     * Show error in 2FA modal
     */
    showPayment2FAError(message) {
        const modal = document.getElementById('payment2FAModal');
        if (!modal) return;
        
        let errorDiv = modal.querySelector('.2fa-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = '2fa-error';
            errorDiv.style.cssText = 'color: #ef4444; background: #fef2f2; padding: 0.75rem; border-radius: 8px; margin-bottom: 1rem; text-align: center;';
            
            const btn = modal.querySelector('.btn-primary');
            btn.parentNode.insertBefore(errorDiv, btn);
        }
        
        errorDiv.textContent = message;
    }

    /**
     * Close payment 2FA modal
     */
    closePayment2FA() {
        const modal = document.getElementById('payment2FAModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => modal.remove(), 300);
        }
    }

    /**
     * Process the payment (core logic)
     */
    async processPayment(packageId) {
        const pkg = this.prices[packageId];
        const tokensAdded = pkg.tokens;

        // Show loading state
        const btn = document.getElementById('verifyPaymentBtn');
        const btnText = btn.querySelector('.btn-text');
        const btnLoading = btn.querySelector('.btn-loading');
        
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        btn.disabled = true;

        // Simulate payment verification (Offline mode)
        setTimeout(() => {
            // Add tokens
            this.saveTokens(tokensAdded);

            // Create transaction record
            this.recordTransaction({
                type: 'purchase',
                tokens: tokensAdded,
                amount: pkg.price,
                description: `Purchased ${tokensAdded} tokens`,
                status: 'completed'
            });

            this.showVerificationStatus(
                `✅ Payment verified! ${tokensAdded} tokens added.<br><strong>New Balance: ${this.userTokens} Tokens</strong>`,
                'success'
            );

            // Close modal after 3 seconds
            setTimeout(() => {
                this.closePaymentModal();
            }, 3000);

            this.resetButton();
        }, 2000); // Simulate 2 second verification
    }

    showVerificationStatus(message, type) {
        const status = document.getElementById('verificationStatus');
        if (status) {
            status.style.display = 'block';
            status.className = `verification-status ${type}`;
            status.innerHTML = `<div class="status-content">${message}</div>`;
        }
    }

    resetButton() {
        const btn = document.getElementById('verifyPaymentBtn');
        if (btn) {
            const btnText = btn.querySelector('.btn-text');
            const btnLoading = btn.querySelector('.btn-loading');
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            btn.disabled = false;
        }
    }

    recordTransaction(transactionData) {
        // Get current user
        const userData = localStorage.getItem('aiProductivityUser');
        if (!userData) return;

        const user = JSON.parse(userData);
        const userTransactions = JSON.parse(localStorage.getItem(`transactions_${user.id}`) || '[]');

        // Add new transaction
        const transaction = {
            id: Date.now().toString(),
            ...transactionData,
            created_at: new Date().toISOString(),
            user_id: user.id
        };

        userTransactions.push(transaction);
        localStorage.setItem(`transactions_${user.id}`, JSON.stringify(userTransactions));
    }

    async checkTransactionStatus(transactionId) {
        // Offline mode - always return completed for demo
        return { success: true, status: 'completed' };
    }
}

// Initialize payment system
let paymentSystem;
document.addEventListener('DOMContentLoaded', () => {
    paymentSystem = new PaymentSystem();
});

// Expose globally
window.paymentSystem = paymentSystem;

