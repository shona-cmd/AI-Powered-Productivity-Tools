# Deployment Guide - Free Hosting Alternatives to Vercel

This guide covers how to deploy your AI Productivity Tools to various free hosting platforms.

## Quick Comparison

| Platform | Free Tier | Best For | API Support |
|----------|-----------|----------|-------------|
| Netlify | 100GB bandwidth | Static sites + Functions | ✅ (Lambda) |
| Cloudflare Pages | Unlimited | High traffic sites | ✅ (Workers) |
| GitHub Pages | 100GB bandwidth | Open source projects | ❌ |
| Railway | $5 credit/month | Full-stack apps | ✅ |
| Render | Sleeps after 15min | Backend APIs | ✅ |

---

## Option 1: Netlify (Recommended)

### Deployment Steps:

1. **Via Git (Recommended):**
   
```
bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Login to Netlify
   netlify login
   
   # Deploy from project directory
   cd /media/naashon/projects/AI-Powered-Productivity-Tools
   netlify deploy --prod
   
```

2. **Via Drag & Drop:**
   - Go to app.netlify.com/drop
   - Drag your project folder to the drop zone
   - Your site will be deployed instantly

3. **Via GitHub:**
   - Push your code to GitHub
   - Go to Netlify and select "Add new site" → "Import an existing project"
   - Select your GitHub repository
   - Netlify will auto-detect settings from netlify.toml

### Custom Domain:
- Go to Domain Management in Netlify dashboard
- Add your custom domain
- Update DNS records as instructed

---

## Option 2: Cloudflare Pages

### Deployment Steps:

1. **Via GitHub:**
   - Go to dash.cloudflare.com/pages
   - Click "Create a project"
   - Connect your GitHub account
   - Select your repository
   - Build settings:
     - Build command: (leave empty)
     - Build output directory: /
   - Click "Save and Deploy"

2. **Via Wrangler CLI:**
   
```
bash
   npm install -g wrangler
   wrangler login
   wrangler pages deploy . --project-name=ai-productivity-tools
   
```

### Features:
- Unlimited bandwidth
- Free SSL
- Fast global CDN
- WebSocket support (paid)

---

## Option 3: GitHub Pages

### Deployment Steps:

1. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Settings → Pages
   - Under "Build and deployment":
     - Source: Deploy from a branch
     - Branch: main (or your default branch)
     - Directory: / (root)

2. **Note:** GitHub Pages only serves static files. Any API endpoints will need to be hosted separately.

---

## Option 4: Railway

### Deployment Steps:

1. **Via CLI:**
   
```
bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Initialize project
   railway init
   # Select "Empty Project" or "Static"
   
   # Deploy
   railway up
   
```

2. **Via GitHub:**
   - Go to railway.app
   - Sign in with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

### Note for APIs:
Railway supports Node.js backend. You'll need to set up a simple server:
```
javascript
// server.js (create this)
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  let filePath = '.' + req.url;
  if (filePath === './') filePath = './index.html';
  
  const extname = path.extname(filePath);
  let contentType = 'text/html';
  
  if (extname === '.js') contentType = 'text/javascript';
  else if (extname === '.css') contentType = 'text/css';
  
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if(error.code == 'ENOENT'){
        fs.readFile('./index.html', (error, content) => {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content, 'utf-8');
        });
      } else {
        res.writeHead(500);
        res.end('Server Error: ' + error.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

---

## Option 5: Render

### Deployment Steps:

1. **Static Site:**
   - Go to render.com
   - Connect your GitHub account
   - Create "New Static Site"
   - Select repository
   - Settings:
     - Build command: (leave empty)
     - Publish directory: .

2. **Note:** Free tier static sites sleep after 15 minutes of inactivity.

---

## API Handling Notes

Since your project has API endpoints (`/api/auth`, `/api/payment`, etc.), you have two options:

### Option A: Mock API for Frontend Demo
Update your JavaScript to use mock data instead of real API calls for demonstration purposes.

### Option B: Separate API Hosting
Host the API on:
- **Railway** - Node.js APIs
- **Render** - Node.js/Python APIs
- **Glitch** - Quick prototypes

---

## Files Already Configured

The following files have been created/updated for deployment:

- ✅ `netlify.toml` - Netlify configuration
- ✅ `_redirects` - Netlify SPA redirect rules
- ✅ `_config.yml` - GitHub Pages configuration

---

## Quick Deploy Commands

### Option 1: Netlify Drag & Drop (Easiest - Recommended)

1. Go to https://app.netlify.com/drop
2. Drag your project folder (`/media/naashon/projects/AI-Powered-Productivity-Tools`) to the drop zone
3. Your site will be deployed instantly with a random URL
4. You can then rename your site in the settings

### Option 2: Netlify CLI with Site Creation:
```
bash
# Install Netlify CLI
npm install -g netlify-cli@17.2.3

# Deploy with explicit site creation
netlify deploy --create-site ai-productivity-tools --prod --dir=.
```

### Option 3: Cloudflare Pages (Best for Unlimited Bandwidth):
```
bash
npm install -g wrangler
wrangler pages deploy . --project-name=ai-productivity-tools
```

### Option 4: Surge.sh (Quickest):
```
bash
npm install -g surge
surge . ai-productivity-tools-demo.surge.sh
```

---

## Troubleshooting

### CORS Issues:
If your API calls fail due to CORS, add this to your HTML head:
```
html
<meta http-equiv="Content-Security-Policy" content="default-src *; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src *;">
```

### SPA Routing:
All platforms support SPA routing via:
- Netlify: `_redirects` file (created)
- Cloudflare: `_redirects` or `404.html`
- GitHub Pages: `404.html` with redirect script

---

For more help, visit:
- Netlify: docs.netlify.com
- Cloudflare Pages: developers.cloudflare.com/pages
- Railway: docs.railway.app
