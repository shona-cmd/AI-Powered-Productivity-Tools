# @ai-productivity/transactions

Transaction history and management module for tracking token purchases and usage.

## Features

- 📋 **Transaction History** - View all past transactions
- 📊 **Statistics** - Get spending and usage statistics
- 📥 **CSV Export** - Export transactions to CSV
- 💾 **Persistent Storage** - Local storage for offline access
- 📱 **Pagination** - Handle large transaction lists

## Installation

```
bash
npm install @ai-productivity/transactions
```

## Usage

### Basic Usage

```
javascript
import TransactionSystem from '@ai-productivity/transactions';

// Initialize
const transactions = new TransactionSystem();

// Fetch transactions
const result = await transactions.getTransactions();
if (result.success) {
    console.log('Transactions:', result.transactions);
    console.log('Total:', result.total);
}
```

### Get Statistics

```
javascript
const statsResult = await transactions.getStats();
if (statsResult.success) {
    console.log('Total Spent:', statsResult.stats.totalSpent);
    console.log('Tokens Purchased:', statsResult.stats.totalTokensPurchased);
    console.log('Tokens Spent:', statsResult.stats.totalTokensSpent);
}
```

### Export to CSV

```
javascript
await transactions.exportTransactions();
// Downloads transactions-2024-01-15.csv
```

### Using with API

```
javascript
const transactions = new TransactionSystem({
    apiBase: 'https://api.yourapp.com'
});

// Fetch from server
const result = await transactions.getTransactions(10, 0);
```

## API

### Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| apiBase | string | '/api' | API base URL |
| storage | object | localStorage | Storage interface |

### Methods

- `getTransactions(limit, offset)` - Get paginated transactions
- `getStats()` - Get transaction statistics
- `exportTransactions()` - Export to CSV
- `formatCurrency(amount)` - Format currency
- `formatDate(dateString)` - Format date
- `getTransactionIcon(type)` - Get icon for type
- `getTransactionsArray()` - Get loaded transactions
- `getStatsData()` - Get loaded stats

### Transaction Object

```
javascript
{
    id: '1234567890',
    type: 'purchase',        // purchase, usage, bonus, refund
    tokens: 100,
    amount: 70000,
    description: 'Purchased 100 tokens',
    status: 'completed',     // completed, pending, failed
    created_at: '2024-01-15T10:30:00.000Z',
    user_id: 'user123'
}
```

## Example: Display Transactions

```
javascript
const result = await transactions.getTransactions();

const html = result.transactions.map(t => `
    <div class="transaction">
        <span class="icon">${transactions.getTransactionIcon(t.type)}</span>
        <span class="type">${transactions.getTransactionTypeLabel(t.type)}</span>
        <span class="tokens">${t.tokens} tokens</span>
        <span class="amount">${transactions.formatCurrency(t.amount)}</span>
        <span class="status ${transactions.getStatusClass(t.status)}">${t.status}</span>
    </div>
`).join('');
```

## Custom Storage

```
javascript
class CustomStorage {
    getItem(key) { ... }
    setItem(key, value) { ... }
    removeItem(key) { ... }
}

const transactions = new TransactionSystem({
    storage: new CustomStorage()
});
```

## License

MIT

## Author

AI Productivity Tools
