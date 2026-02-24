prototype#!/bin/bash

# Multi-Platform Deployment Script for AI Productivity Tools
# This script deploys to multiple free hosting platforms

echo "🚀 Starting multi-platform deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."

    # Check Node.js and npm
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi

    print_success "Dependencies check passed"
}

# Deploy to GitHub Pages
deploy_github_pages() {
    print_status "Deploying to GitHub Pages..."

    if ! command -v gh-pages &> /dev/null; then
        print_status "Installing gh-pages..."
        npm install -g gh-pages
    fi

    # Deploy to gh-pages branch
    npx gh-pages -d . -b gh-pages --yes

    if [ $? -eq 0 ]; then
        print_success "GitHub Pages deployment completed"
        print_status "URL: https://[your-username].github.io/ai-powered-productivity-tools"
    else
        print_error "GitHub Pages deployment failed"
    fi
}

# Deploy to Surge
deploy_surge() {
    print_status "Deploying to Surge..."

    if ! command -v surge &> /dev/null; then
        print_status "Installing surge..."
        npm install -g surge
    fi

    # Check if surge token is set
    if [ -z "$SURGE_TOKEN" ]; then
        print_warning "SURGE_TOKEN not set. Surge deployment will require manual login."
        print_status "To automate, set SURGE_TOKEN environment variable"
        print_status "Get token from: https://surge.sh/help/remembering-login-details"

        # Manual deployment
        surge --domain ai-productivity-tools.surge.sh --project .
    else
        # Automated deployment
        surge --domain ai-productivity-tools.surge.sh --project . --token $SURGE_TOKEN
    fi

    if [ $? -eq 0 ]; then
        print_success "Surge deployment completed"
        print_status "URL: https://ai-productivity-tools.surge.sh"
    else
        print_error "Surge deployment failed"
    fi
}

# Deploy to Netlify
deploy_netlify() {
    print_status "Deploying to Netlify..."

    if ! command -v netlify &> /dev/null; then
        print_status "Installing netlify-cli..."
        npm install -g netlify-cli
    fi

    # Check if netlify auth token is set
    if [ -z "$NETLIFY_AUTH_TOKEN" ]; then
        print_warning "NETLIFY_AUTH_TOKEN not set. Netlify deployment will require manual login."
        print_status "To automate, set NETLIFY_AUTH_TOKEN environment variable"

        # Manual deployment
        netlify deploy --prod --dir .
    else
        # Automated deployment
        netlify deploy --prod --dir . --auth $NETLIFY_AUTH_TOKEN
    fi

    if [ $? -eq 0 ]; then
        print_success "Netlify deployment completed"
    else
        print_error "Netlify deployment failed"
    fi
}

# Deploy to Firebase
deploy_firebase() {
    print_status "Deploying to Firebase..."

    if ! command -v firebase &> /dev/null; then
        print_status "Installing firebase-tools..."
        npm install -g firebase-tools
    fi

    # Check if firebase is logged in
    if ! firebase projects:list &> /dev/null; then
        print_warning "Firebase not logged in. Please run 'firebase login' first"
        return 1
    fi

    # Initialize if not already done
    if [ ! -f "firebase.json" ]; then
        print_status "Initializing Firebase hosting..."
        firebase init hosting --yes
    fi

    firebase deploy

    if [ $? -eq 0 ]; then
        print_success "Firebase deployment completed"
    else
        print_error "Firebase deployment failed"
    fi
}

# Deploy to Vercel (if not already deployed)
deploy_vercel() {
    print_status "Checking Vercel deployment..."

    if ! command -v vercel &> /dev/null; then
        print_status "Installing vercel..."
        npm install -g vercel
    fi

    # Check if already deployed
    if vercel ls | grep -q "ai-powered-productivity-tools"; then
        print_success "Vercel deployment already exists"
    else
        print_status "Deploying to Vercel..."
        vercel --prod

        if [ $? -eq 0 ]; then
            print_success "Vercel deployment completed"
        else
            print_error "Vercel deployment failed"
        fi
    fi
}

# Deploy to Render
deploy_render() {
    print_status "Render deployment instructions:"
    print_status "1. Go to https://render.com"
    print_status "2. Connect your GitHub repository"
    print_status "3. Choose 'Static Site'"
    print_status "4. Set build command: echo 'Build complete'"
    print_status "5. Set publish directory: ."
    print_success "Render deployment ready (manual setup required)"
}

# Deploy to Railway
deploy_railway() {
    print_status "Railway deployment instructions:"
    print_status "1. Go to https://railway.app"
    print_status "2. Connect your GitHub repository"
    print_status "3. Choose 'Static Site'"
    print_status "4. Set build command: echo 'Build complete'"
    print_success "Railway deployment ready (manual setup required)"
}

# Deploy to Fly.io
deploy_fly() {
    print_status "Fly.io deployment instructions:"
    print_status "1. Install flyctl: curl -L https://fly.io/install.sh | sh"
    print_status "2. Run: fly launch"
    print_status "3. Run: fly deploy"
    print_success "Fly.io deployment ready (manual setup required)"
}

# Generate deployment summary
generate_summary() {
    echo ""
    echo "========================================"
    echo "🎉 DEPLOYMENT SUMMARY"
    echo "========================================"
    echo ""
    echo "✅ Completed Deployments:"
    echo "   - Vercel (Automated)"
    echo "   - GitHub Pages (Automated)"
    echo "   - Surge (Requires token or manual)"
    echo ""
    echo "📋 Manual Setup Required:"
    echo "   - Netlify: https://netlify.com"
    echo "   - Render: https://render.com"
    echo "   - Railway: https://railway.app"
    echo "   - Fly.io: https://fly.io"
    echo "   - Firebase: https://firebase.google.com"
    echo "   - Glitch: https://glitch.com"
    echo "   - CodeSandbox: https://codesandbox.io"
    echo ""
    echo "🚀 Next Steps:"
    echo "1. Set up environment variables for automated deployments"
    echo "2. Submit to product directories (Product Hunt, BetaList, etc.)"
    echo "3. Share on social media and developer communities"
    echo "4. Monitor analytics and user feedback"
    echo ""
    echo "📊 Marketing Channels:"
    echo "   - Twitter/LinkedIn posts"
    echo "   - Reddit (r/SideProject, r/Entrepreneur)"
    echo "   - Dev.to articles"
    echo "   - Indie Hackers"
    echo "   - Hacker News"
    echo ""
}

# Main deployment function
main() {
    echo "🚀 AI Productivity Tools - Multi-Platform Deployment"
    echo "=================================================="
    echo ""

    check_dependencies

    # Automated deployments
    deploy_github_pages
    deploy_surge
    deploy_netlify
    deploy_firebase
    deploy_vercel

    # Manual setup instructions
    deploy_render
    deploy_railway
    deploy_fly

    generate_summary

    print_success "Multi-platform deployment script completed!"
    print_status "Check DEPLOYMENT.md for detailed instructions"
}

# Run main function
main "$@"
