# 🚀 AI Productivity Tools - Professional AI Platform

<p align="center">
  <img src="https://img.shields.io/badge/Version-2.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/AI-GPT--4%20%7C%20Claude%20%7C%20Gemini-orange.svg" alt="AI Providers">
</p>

A comprehensive, production-ready AI productivity suite featuring 10+ AI-powered tools with multi-provider support (OpenAI GPT-4, Anthropic Claude, Google Gemini), secure authentication, token-based payments, and professional code architecture.

---

## ✨ Features

### 🔟 10+ AI Tools

| Tool | Description |
|------|-------------|
| ✍️ **AI Writing Assistant** | Professional emails, blogs, resumes, social media content |
| 📋 **AI Task Manager** | Smart prioritization with Eisenhower Matrix |
| 💼 **Business Toolkit** | Invoices, quotes, proposals, marketing copy |
| 📚 **Student Tools** | Summarization, practice questions, study plans |
| 💻 **Code Editor** | AI-powered code review, debug, and optimization |
| 🤖 **AI Chat** | Multi-model chat (GPT-4, Claude, Gemini) |
| 🎨 **Image Generator** | DALL-E 3 quality image creation |
| 🌍 **Translator** | 50+ languages with natural translations |
| 🔍 **SEO Optimizer** | Keyword optimization and content analysis |
| 📊 **Research Assistant** | Comprehensive research with citations |

### 🔐 Security Features

- **Two-Factor Authentication (2FA)** - TOTP-based with backup codes
- **Secure Token Storage** - Encrypted session management
- **Input Validation** - XSS and CSRF protection
- **Rate Limiting** - API protection

### 💳 Payments

- **Mobile Money** - MTN Uganda support
- **Token System** - 300 free tokens for new users
- **Secure Verification** - Transaction reference validation

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **AI** | OpenAI GPT-4, Anthropic Claude, Google Gemini |
| **Payments** | Mobile Money (MTN) |
| **Deployment** | Vercel, Netlify, Docker |
| **Build** | ESBuild, ESLint, Prettier |

---

## 📦 Project Structure

```
AI-Powered-Productivity-Tools/
├── src/
│   ├── core/                  # Core utilities
│   │   ├── logger.js         # Logging system
│   │   ├── errorHandler.js   # Error handling
│   │   ├── validation.js      # Input validation
│   │   ├── notifications.js  # Toast notifications
│   │   └── storage.js        # Secure storage
│   └── components/            # UI components
│       ├── Skeleton.js       # Loading skeletons
│       └── KeyboardShortcuts.js
├── scripts/
│   └── build.js              # Build script
├── api/                      # Serverless API
├── docs/                     # Documentation
├── index.html                # Main entry
├── app.js                    # Application logic
├── ai-engine.js              # AI integration
├── auth.js                   # Authentication
├── payment.js                # Payment system
└── styles.css               # Main styles
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```
bash
# Clone the repository
git clone https://github.com/yourusername/AI-Powered-Productivity-Tools.git

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

Create a `.env` file:

```
env
# OpenAI API Key
OPENAI_API_KEY=sk-...

# Anthropic API Key (optional)
ANTHROPIC_API_KEY=sk-ant-...

# Google Gemini API Key (optional)
GEMINI_API_KEY=...

# Mobile Money (optional)
PHONE_NUMBER=256761485613
```

---

## 🎯 Usage

1. **Sign Up** → Get 300 FREE TOKENS
2. **Add API Key** → Configure your AI provider
3. **Choose Tool** → Access 10+ AI tools
4. **Generate** → Use tokens for AI content

---

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md).

```
bash
# Create a feature branch
git checkout -b feature/amazing-feature

# Commit your changes
git commit -m 'feat: Add amazing feature'

# Push to GitHub
git push origin feature/amazing-feature
```

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- OpenAI for GPT models
- Anthropic for Claude
- Google for Gemini
- All contributors and users

---

## 📞 Support

- 📧 Email: support@aiproductivitytools.com
- 💬 Issues: [GitHub Issues](https://github.com/naashonx/AI-Powered-Productivity-Tools/issues)
- 📖 Documentation: [Wiki](https://github.com/naashonx/AI-Powered-Productivity-Tools/wiki)

---

<p align="center">Built with ❤️ for productivity enthusiasts worldwide</p>
