#!/bin/bash

# Double Coin Dispatcher - Deployment Script
echo "🚛 Deploying Double Coin Dispatcher..."

# Check if netlify CLI is available
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI is not installed. Install it with: npm install -g netlify-cli"
    exit 1
fi

# Deploy to production
echo "📦 Building and deploying to production..."
netlify deploy --prod --dir .

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Live URL: https://double-coin-dispatcher.netlify.app"
    echo "📊 Admin URL: https://app.netlify.com/projects/double-coin-dispatcher"
    
    # Open the live site
    read -p "🚀 Open live site in browser? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open https://double-coin-dispatcher.netlify.app
    fi
else
    echo "❌ Deployment failed!"
    exit 1
fi
