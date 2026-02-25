# GitHub Marketplace Setup Guide

## Overview
This guide will help you list the AI Productivity Tools Bundle on GitHub Marketplace.

## Prerequisites
- GitHub account
- Repository pushed to GitHub
- A logo/icon for your app (we've created one at `assets/icon.svg`)

## Steps to List on GitHub Marketplace

### Step 1: Create a GitHub App
1. Go to https://github.com/settings/apps/new
2. Fill in the following details:
   - **GitHub App name**: `AI Productivity Tools Bundle`
   - **Description**: A complete AI productivity tools bundle to help students, professionals, and businesses work smarter with AI-powered writing, task management, business tools, and study assistance.
   - **Homepage URL**: https://github.com/shona-cmd/AI-Powered-Productivity-Tools
   - **Authorization callback URL**: https://github.com/shona-cmd/AI-Powered-Productivity-Tools
   - **Webhook URL**: https://ai-powered-productivity-tools-6tirxqs5s-naashons-projects.vercel.app/api/webhook
   - **Webhook secret**: Create a secret for signature verification

3. Click "Create GitHub App"

### Step 2: Upload Your Icon
- Use the icon we created at `assets/icon.svg`
- Or create your own 128x128px or larger PNG icon

### Step 3: Apply for GitHub Marketplace
1. Go to your GitHub App settings
2. Click "Apply for GitHub Marketplace"
3. Fill out the application form:
   - **Listing name**: AI Productivity Tools Bundle
   - **Short description**: AI-powered productivity tools for writing, task management, business, and studying
   - **Long description**: Use the content from README.md
   - **Pricing**: Choose Free or paid ($19 for Pro Bundle)
   - **Categories**: Education, Productivity

### Step 4: Submit for Review
- Submit your application
- GitHub will review within a few days

## Files Ready for Marketplace
- `assets/icon.svg` - App icon (convert to PNG before uploading)
- `PRIVACY.md` - Privacy policy
- `.github/app.yml` - App configuration
- `api/webhook.js` - Webhook endpoint for handling GitHub events

## Webhook URL Setup

We've created `api/webhook.js` to handle GitHub events. Your deployed webhook URL is:

- **Vercel**: `https://ai-powered-productivity-tools-6tirxqs5s-naashons-projects.vercel.app/api/webhook`
- **Netlify**: `https://your-site-name.netlify.app/api/webhook`

### Events Handled:
- `marketplace_purchase` - New purchases, cancellations, plan changes
- `issues` - Issue events
- `pull_request` - Pull request events  
- `push` - Code push events

### To enable webhooks:
1. Deploy your app to Vercel or Netlify
2. Get your deployed URL
3. Go to GitHub App settings → Webhook
4. Add your URL: `https://your-deployed-url.com/api/webhook`
5. Select events to subscribe to

## Tips for Approval
1. Make sure your app has a clear purpose
2. Include proper privacy policy
3. Provide good screenshots of your tools
4. Be responsive during review process

## Alternative: List as a Template Repository
Instead of GitHub Marketplace, you can also:
1. Go to repository Settings
2. Check "Template repository"
3. This makes it easy for others to fork and use

---
For questions, check GitHub Marketplace documentation: https://docs.github.com/en/apps/marketplace
