# @ai-productivity/payment

Mobile money payment integration module for token purchases. Supports MTN Mobile Money and similar payment methods.

## Features

- 📱 **Mobile Money** - MTN Mobile Money integration
- 🪙 **Token System** - Purchase and manage tokens
- 💳 **Payment Verification** - Transaction reference verification
- 📊 **Transaction History** - Record and track purchases
- 💾 **Persistent Storage** - Local storage for token balance

## Installation

```
bash
npm install @ai-productivity/payment
```

## Usage

### Basic Usage

```
javascript
import PaymentSystem from '@ai-productivity/payment';

// Initialize payment system
const payment = new PaymentSystem();

// Get token balance
const balance = payment.getTokenBalance();
console.log('Current balance:', balance);

// Get available packages
const packages = payment.getPackages();
console.log('Available packages:', packages);
```

### Purchasing Tokens

```
javascript
// Submit payment for verification
const result = await payment.submitAndVerifyPayment(
    '0771234567',           // Phone number
    'MPN123456789',        // Transaction reference
    '100_tokens'            // Package ID
);

if (result.success) {
    console.log(result.message);
    console.log('New balance:', result.newBalance);
}
```

### Using with API

```
javascript
const payment = new PaymentSystem({
    apiBase: 'https://api.yourapp.com',
    phoneNumber: '0761485613'
});

// Load packages from API
await payment.loadPackagesFromAPI();

// Create payment session
const session = await payment.createPaymentSession('100_tokens', '0771234567');
```

### Custom Packages

```
javascript
const payment = new PaymentSystem({
    prices: {
        '25_tokens': { tokens: 25, price: 20000, label: 'UGX 20,000' },
        '100_tokens': { tokens: 100, price: 70000, label: 'UGX 70,000' },
        '200_tokens': { tokens: 200, price: 130000, label: 'UGX 130,000' }
    }
});
```

## API

### Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| phoneNumber | string | '0761485613' | Payment receiving number |
| apiBase | string | '/api' | API base URL |
| prices | object | Default packages | Token packages |
| storage | object | localStorage | Storage interface |

### Default Packages

| Package ID | Tokens | Price |
|------------|--------|-------|
| 10_tokens | 10 | UGX 10,000 |
| 50_tokens | 50 | UGX 40,000 |
| 100_tokens | 100 | UGX 70,000 |
| 500_tokens | 500 | UGX 300,000 |

### Methods

- `getTokenBalance()` - Get current token balance
- `addTokens(amount)` - Add tokens to balance
- `deductTokens(amount)` - Deduct tokens from balance
- `getPackages()` - Get available packages
- `getPackage(id)` - Get specific package
- `createPaymentSession(packageId, phone)` - Create payment session
- `submitAndVerifyPayment(phone, ref, packageId)` - Verify payment
- `recordTransaction(data)` - Record transaction
- `checkTransactionStatus(id)` - Check transaction status

## Example: Token Deduction

```
javascript
const payment = new PaymentSystem();

// Check balance before using service
const cost = 5;
if (payment.getTokenBalance() >= cost) {
    // Deduct tokens for using a feature
    payment.deductTokens(cost);
    console.log('Feature used! Remaining:', payment.getTokenBalance());
} else {
    // Show purchase modal
    payment.openPaymentModal();
}
```

## Custom Storage

```
javascript
class CustomStorage {
    getItem(key) { ... }
    setItem(key, value) { ... }
    removeItem(key) { ... }
}

const payment = new PaymentSystem({
    storage: new CustomStorage()
});
```

## License

MIT

## Author

AI Productivity Tools
