/**
 * AI Productivity Tools - Payment & Token System
 * Mobile Money Payment Integration (0761485613)
 */

class PaymentSystem {
    constructor() {
        this.phoneNumber = '0761485613';
        this.prices = {
            '10_tokens': 10,
            '50_tokens': 40,
            '100_tokens': 70,
            '500_tokens': 300
        };
        this.userTokens = this.loadTokens();
        this.init();
    }

    init() {
        this.createPaymentModal();
        this.createTokenDisplay();
    }

    loadTokens() {
        const saved = localStorage.getItem('aiProductivityTokens');
        return saved ? parseInt(saved) : 0;
    }

    saveTokens(amount) {
        this.userTokens += amount;
        localStorage.setItem('aiProductivityTokens', this.userTokens.toString());
        this.updateTokenDisplay();
        return this.userTokens;
    }

    getTokenBalance() {
        return this.userTokens;
    }

    createPaymentModal() {
        const modal = document.createElement('div');
        modal.id = 'paymentModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content payment-modal-content">
                <span class="close-btn" onclick="paymentSystem.closePaymentModal()">&times;</span>
                <div class="payment-header">
                    <div class="payment-icon">💳</div>
                    <h2>Buy Tokens</h2>
                    <p>Pay via Mobile Money</p>
                </div>
                <div class="phone-display">
                    <span class="phone-label">Send to:</span>
                    <span class="phone-number">${this.phoneNumber}</span>
                    <span class="network-badge">MTN Mobile Money</span>
                </div>
                <div class="token-packages">
                    <h3>Choose Package</h3>
                    <div class="package-grid">
                        <div class="package-card" onclick="paymentSystem.selectPackage('10_tokens', event)">
                            <div class="package-tokens">10</div>
                            <div class="package-price">$10</div>
                        </div>
                        <div class="package-card" onclick="paymentSystem.selectPackage('50_tokens', event)">
                            <div class="package-tokens">50</div>
                            <div class="package-price">$40</div>
                        </div>
                        <div class="package-card featured" onclick="paymentSystem.selectPackage('100_tokens', event)">
                            <div class="package-tokens">100</div>
                            <div class="package-price">$70</div>
                        </div>
                        <div class="package-card" onclick="paymentSystem.selectPackage('500_tokens', event)">
                            <div class="package-tokens">500</div>
                            <div class="package-price">$300</div>
                        </div>
                    </div>
                </div>
                <div class="payment-form" id="paymentForm" style="display:none;">
                    <div class="selected-package" id="selectedPackage"></div>
                    <div class="form-group">
                        <label>Your Mobile Number</label>
                        <input type="tel" id="payerPhone" placeholder="07XXXXXXXX" maxlength="10">
                    </div>
                    <button class="btn btn-primary btn-block" onclick="paymentSystem.submitPayment()">
                        I've Sent Payment - Verify
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    createTokenDisplay() {
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
        document.querySelectorAll('.package-card').forEach(c => c.classList.remove('selected'));
        event.target.closest('.package-card').classList.add('selected');
        const tokens = packageId.split('_')[0];
        document.getElementById('selectedPackage').innerHTML = `
            <div class="selected-package-display">
                <strong>${tokens} Tokens</strong> - $${this.prices[packageId]}
            </div>
        `;
        document.getElementById('paymentForm').style.display = 'block';
    }

    openPaymentModal() {
        document.getElementById('paymentModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closePaymentModal() {
        document.getElementById('paymentModal').classList.remove('active');
        document.body.style.overflow = '';
    }

    submitPayment() {
        const phone = document.getElementById('payerPhone').value;
        if (!phone || phone.length < 10) {
            alert('Please enter your mobile number');
            return;
        }
        const selected = document.querySelector('.package-card.selected');
        if (selected) {
            const tokens = parseInt(selected.querySelector('.package-tokens').textContent);
            this.saveTokens(tokens);
            alert(`✅ ${tokens} tokens credited!`);
            this.closePaymentModal();
        }
    }
}

let paymentSystem;
document.addEventListener('DOMContentLoaded', () => {
    paymentSystem = new PaymentSystem();
});
window.paymentSystem = paymentSystem;

