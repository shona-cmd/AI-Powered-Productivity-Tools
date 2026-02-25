# GitHub App Setup Guide

## Option 1: Install from Repository (Recommended)

Since we've added the `.github/app.yml` manifest to your repository, you can install the app directly from GitHub:

1. Go to: https://github.com/shona-cmd/AI-Powered-Productivity-Tools/settings/installations
2. Click "Install App"
3. Select the repositories you want to use it with
4. Complete the installation

## Option 2: Create New GitHub App Manually

If you want to create a new GitHub App for the Marketplace:

1. Go to: https://github.com/settings/apps/new
2. Fill in the details:
   - **App Name**: AI Productivity Tools
   - **Homepage URL**: https://github.com/shonahttps://github.com/shona-cmd/AI-Powered-Productivity-Tools
   - **Webhook URL**: (leave empty or add your deployment URL)-cmd/AI-Powered-Productivity-Tools
   - **Callback URL**: 
3. Set permissions:
   - Contents: Read-only
   - Issues: Read-only
   - Pull requests: Read-only
4. Subscribe to events:
   - Issues
   - Pull requests
5. Click "Create GitHub App"

## Option 3: List on GitHub Marketplace

To list your app on GitHub Marketplace:

1. After creating the app, go to: https://github.com/settings/apps/YOUR_APP_ID
2. Click "List this app on GitHub Marketplace"
3. Fill in the required information:
   - Pricing plans (Free or paid)
   - Categories (Education, Productivity, Developer Tools)
   - Marketing description
   - Screenshots
4. Submit for review

## Current Files in Repository

- `.github/app.yml` - GitHub App manifest
- `.github/workflows/generate-directory-listing.yml` - GitHub Action for directory listing
- `assets/icon.svg` - App icon

## Next Steps

1. ✅ Application deployed to: https://ai-powered-productivity-tools-6tirxqs5s-naashons-projects.vercel.app
2. ✅ Webhook URL ready: https://ai-powered-productivity-tools-6tirxqs5s-naashons-projects.vercel.app/api/webhook
3. Create GitHub App at https://github.com/settings/apps/new
4. List on GitHub Marketplace
