#!/bin/bash

# Deploy AI Productivity Tools to fly.io
# Usage: ./deploy-fly.sh

set -e

# Add flyctl to PATH
export PATH="$HOME/.fly/bin:$PATH"

echo "🚀 Deploying AI Productivity Tools to fly.io..."

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "❌ flyctl is not installed."
    echo "Installing flyctl..."
    curl -L https://fly.io/install.sh | sh
    export PATH="$HOME/.fly/bin:$PATH"
fi

# Check if user is logged in
echo "🔐 Checking fly.io authentication..."
if ! flyctl auth whoami &> /dev/null; then
    echo "Please log in to fly.io in your browser."
    echo "Opening authentication page..."
    flyctl auth login
    echo "✅ Logged in successfully!"
fi

# Check if app exists, if not create it
echo "📦 Checking/creating app on fly.io..."
APP_NAME="ai-productivity-tools"

if ! flyctl apps list | grep -q "$APP_NAME"; then
    echo "Creating new app: $APP_NAME"
    flyctl apps create --name "$APP_NAME" --org personal
else
    echo "App $APP_NAME already exists"
fi

# Deploy the app
echo "🚀 Deploying to fly.io..."
flyctl deploy

# Get the app URL
echo ""
echo "🌐 Your app is deployed at:"
flyctl apps list | grep "$APP_NAME" || echo "https://$APP_NAME.fly.dev"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Useful commands flyctl status                   :"
echo "  - Check deployment status"
echo "  flyctl logs                      - View logs"
echo "  flyctl open                      - Open the app in browser"
echo "  flyctl scale count 2             - Scale to 2 machines"
echo "  flyctl dashboard                 - Open dashboard"
