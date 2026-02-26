# Contributing to AI Productivity Tools

Thank you for your interest in contributing to AI Productivity Tools! This document provides guidelines for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Environment](#development-environment)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please be respectful and inclusive.

## Getting Started

1. **Fork the repository** - Click the "Fork" button on GitHub
2. **Clone your fork** - `git clone https://github.com/YOUR_USERNAME/AI-Powered-Productivity-Tools.git`
3. **Add upstream** - `git remote add upstream https://github.com/ORIGINAL_OWNER/AI-Powered-Productivity-Tools.git`
4. **Create a branch** - `git checkout -b feature/your-feature-name`

## Development Environment

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A code editor (VS Code recommended)

### Setup

```
bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

Create a `.env` file in the root directory:

```
env
# OpenAI API (for AI features)
OPENAI_API_KEY=your_openai_key

# Anthropic API (alternative AI)
ANTHROPIC_API_KEY=your_anthropic_key

# Google Gemini API (alternative AI)
GEMINI_API_KEY=your_gemini_key

# Mobile Money Payment (optional)
PHONE_NUMBER=256761485613
```

## Making Changes

1. Create a new branch for your feature or bug fix
2. Make your changes following our coding standards
3. Add tests if applicable
4. Update documentation as needed
5. Commit your changes with clear messages

## Pull Request Process

### Before Submitting

1. **Test your changes** - Ensure all features work correctly
2. **Run linting** - `npm run lint`
3. **Build the project** - `npm run build`
4. **Update CHANGELOG.md** - Document your changes

### Submitting

1. Push your branch to your fork
2. Open a Pull Request
3. Fill out the PR template completely
4. Wait for review - we typically respond within 48 hours

### PR Title Format

```
type(scope): description
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style/formatting
- `refactor` - Code refactoring
- `test` - Tests
- `chore` - Maintenance

Examples:
- `feat(auth): Add OAuth login support`
- `fix(payment): Resolve mobile money verification issue`
- `docs(readme): Update installation instructions`

## Coding Standards

### JavaScript

- Use ES6+ features
- Use `const` and `let` - never `var`
- Use meaningful variable names
- Add JSDoc comments for functions
- Maximum line length: 100 characters

### HTML

- Use semantic HTML5 elements
- Include proper ARIA labels for accessibility
- Keep attributes in alphabetical order

### CSS

- Use CSS custom properties (variables)
- Follow BEM naming convention
- Mobile-first responsive design

### File Structure

```
src/
├── core/           # Core utilities
│   ├── logger.js
│   ├── errorHandler.js
│   ├── validation.js
│   └── notifications.js
├── components/     # Reusable UI components
├── modules/        # Feature modules
└── main.js         # Entry point
```

## Commit Messages

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Rules

- Subject line: 50 characters max
- Use imperative mood
- Capitalize first letter
- No period at end
- Body: 72 characters per line
- Reference issues: `Closes #123`

### Example

```
feat(auth): Add two-factor authentication

- Implement TOTP-based 2FA
- Add backup codes generation
- Integrate with payment system

Closes #45
```

## Reporting Bugs

### Before Reporting

1. Check if the issue has been reported
2. Try to reproduce the bug
3. Check your browser console for errors

### Bug Report Template

```
markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.0.0]
```

## Feature Requests

### Before Requesting

1. Check if feature already exists
2. Consider if it aligns with project goals
3. Think about implementation details

### Feature Request Template

```
markdown
**Feature Description**
Clear description of the feature

**Problem Solved**
What problem does this solve?

**Proposed Solution**
How should it work?

**Alternatives**
Any alternative solutions considered?

**Additional Context**
Screenshots, mockups, etc.
```

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Social media highlights

## Questions?

- Open an issue for discussion
- Join our community chat
- Email: support@aiproductivitytools.com

---

Thank you for contributing! 🎉
