# AI Productivity Tools - Vercel Deployment Guide

## 🚀 Deploy to Vercel

### Quick Deploy (Recommended)

1. **Push to GitHub/GitLab**
   ```bash
   git add .
   git commit -m "Add mobile money payment integration"
   git push
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your repository
   - Vercel will auto-detect settings from `vercel.json`

3. **Configure Environment Variables** (Optional)
   - `MOBILE_MONEY_PHONE`: Your mobile money number (default: 0761485613)
   - `MOBILE_MONEY_NETWORK`: Network name (default: MTN)

4. **Deploy**
   - Click "Deploy"
   - Your app will be live in ~1-2 minutes

---

## 📱 Mobile Money Payment System

### How It Works

1. **User selects a token package** (10, 50, 100, or 500 tokens)
2. **Payment instructions are displayed**
3. **User sends money via Mobile Money** (USSD *165# or app)
4. **User enters transaction reference** for verification
5. **System verifies payment** via API
6. **Tokens are credited** to user's account

### Payment Flow

```
User Selects Package
        ↓
Display Payment Instructions
(Send X UGX to 0761485613)
        ↓
User Makes Payment (Mobile Money)
        ↓
User Enters Transaction Reference
        ↓
API Verifies Payment
        ↓
Tokens Credited to User Account
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/packages` | GET | Get available packages |
| `/api/payment/create` | POST | Create payment session |
| `/api/payment/verify` | POST | Verify payment with reference |
| `/api/payment/status?id=...` | GET | Check transaction status |
| `/api/health` | GET | Health check |

---

## 💰 Token Packages (UGX)

| Tokens | Price | Best For |
|--------|-------|----------|
| 10 Tokens | UGX 10,000 | Testing / Light use |
| 50 Tokens | UGX 40,000 | Regular users |
| 100 Tokens | UGX 70,000 | ⭐ Best Value |
| 500 Tokens | UGX 300,000 | Power users |

---

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file for local development:

```env
MOBILE_MONEY_PHONE=0761485613
MOBILE_MONEY_NETWORK=MTN
MOBILE_MONEY_COUNTRY=UG
```

### Customizing Payment Flow

For production, integrate with actual payment gateway:

```javascript
// api/payment.js - Replace simulation with real API

async function simulatePaymentVerification(reference, amount) {
    // For M-Pesa integration:
    // 1. Use M-Pesa Daraja API
    // 2. Implement STK Push for real-time verification
    // 3. Set up webhook callback URL
    
    // Example M-Pesa verification:
    // const response = await fetch('https://api.m-pesa.com/...');
    // return response.data.ResultCode === 0;
    
    return Math.random() > 0.3; // Demo only
}
```

---

## 🏗️ Project Structure

```
├── index.html              # Main landing page
├── styles.css              # Main styles
├── payment.css            # Payment modal styles
├── app.js                  # Main application logic
├── payment.js             # Payment system (client-side)
├── vercel.json            # Vercel configuration
├── package.json           # Node dependencies
├── api/
│   └── payment.js         # Serverless API for payments
└── README.md              # This file
```

---

## 🔒 Security Considerations

### Current Implementation (Demo)
- ✅ Mobile money number is visible (required for payment)
- ⚠️ Payment verification is simulated
- ⚠️ No database storage (tokens in localStorage)

### Production Recommendations

1. **Use a database**
   ```javascript
   // Integrate with PostgreSQL, MongoDB, or Supabase
   const { createClient } = require('@supabase/supabase-js');
   const supabase = createClient(url, key);
   ```

2. **Add webhook verification**
   ```javascript
   // M-Pesa webhook example
   app.post('/api/webhook/mpesa', async (req, res) => {
     const { TransactionType, TransID, TransAmount } = req.body;
     // Verify and credit tokens
   });
   ```

3. **Rate limiting**
   ```javascript
   const rateLimit = require('express-rate-limit');
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests
   });
   ```

4. **HTTPS enforcement**
   ```json
   {
     "headers": [
       {
         "source": "/(.*)",
         "headers": [{ "key": "Strict-Transport-Security", "value": "max-age=31536000" }]
       }
     ]
   }
   ```

---

## 🧪 Testing

### Local Development

```bash
# Install Vercel CLI
npm i -g vercel

# Run locally with API
vercel dev
```

### Test Payment Flow

1. Select a token package
2. Note the amount and phone number
3. Enter any transaction reference (e.g., "TEST123456789")
4. Click "Verify Payment"
5. Tokens will be credited (70% success rate in demo mode)

---

## 📈 Monitoring

### Vercel Dashboard
- Check "Functions" tab for API usage
- Monitor "Speed Insights" for performance
- View "Logs" for debugging

### Available Metrics
- API response times
- Function invocations
- Bandwidth usage
- Error rates

---

## 🐛 Troubleshooting

### Common Issues

**1. Payment API not working**
```bash
# Check vercel.json is correct
cat vercel.json

# Ensure api/ folder exists
ls -la api/
```

**2. CORS errors**
```javascript
// Headers are set in vercel.json
// If still issues, add to api/payment.js:
res.setHeader('Access-Control-Allow-Origin', '*');
```

**3. Tokens not saving**
```javascript
// localStorage may be disabled
// Check browser console for errors
// Consider using cookies as backup
```

---

## 📝 API Response Examples

### Create Payment
```json
{
  "success": true,
  "transactionId": "TXN-123456789-abc123",
  "instructions": {
    "step1": "Send UGX 10000 to 0761485613 (MTN)",
    "step2": "Use your mobile money PIN",
    "step3": "Enter transaction reference below",
    "step4": "Tokens will be credited"
  },
  "expiresIn": "30 minutes"
}
```

### Verify Payment
```json
{
  "success": true,
  "status": "completed",
  "tokens": 100,
  "message": "Successfully credited 100 tokens"
}
```

---

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI](https://vercel.com/cli)
- [M-Pesa Darja API](https://developer.safaricom.co.ke/)
- [Supabase Database](https://supabase.com/)
- [Vercel Speed Insights](https://vercel.com/docs/speed-insights)

---

## 📄 License

MIT License - Build, sell, and create value!

---

**Built with ❤️ for African entrepreneurs and developers**

