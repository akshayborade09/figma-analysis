#!/bin/bash

# Figma UX Analysis - Secrets Setup Script
# This script helps you configure the required API keys for the Cloudflare Worker

set -e

echo "🔐 Figma UX Analysis - Secrets Setup"
echo "======================================"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Error: Wrangler CLI is not installed."
    echo "📦 Install it with: npm install -g wrangler"
    echo "   Or run: npm install (to use local version)"
    exit 1
fi

echo "✅ Wrangler CLI found"
echo ""

# Check if logged in
echo "🔍 Checking Cloudflare login status..."
if ! wrangler whoami &> /dev/null; then
    echo "⚠️  Not logged in to Cloudflare"
    echo "🔑 Please login first:"
    echo "   Run: wrangler login"
    exit 1
fi

echo "✅ Logged in to Cloudflare"
echo ""

# Set ANTHROPIC_API_KEY
echo "📝 Setting up ANTHROPIC_API_KEY..."
echo ""
echo "Get your API key from: https://console.anthropic.com/"
echo "The key should start with 'sk-ant-api...' "
echo ""
wrangler secret put ANTHROPIC_API_KEY

echo ""
echo "✅ ANTHROPIC_API_KEY configured"
echo ""

# Set FIGMA_ACCESS_TOKEN
echo "📝 Setting up FIGMA_ACCESS_TOKEN..."
echo ""
echo "Get your access token from:"
echo "https://www.figma.com/developers/api#access-tokens"
echo ""
echo "Steps:"
echo "1. Go to Figma Settings → Account → Personal Access Tokens"
echo "2. Click 'Create new token'"
echo "3. Name it 'UX Analysis Bot'"
echo "4. Copy the token"
echo ""
wrangler secret put FIGMA_ACCESS_TOKEN

echo ""
echo "✅ FIGMA_ACCESS_TOKEN configured"
echo ""

# Verify secrets
echo "🔍 Verifying secrets..."
echo ""
wrangler secret list

echo ""
echo "✅ All secrets configured successfully!"
echo ""
echo "📚 Next steps:"
echo "   1. Test locally: npm run dev"
echo "   2. Deploy: npm run deploy"
echo "   3. View logs: npm run tail"
echo ""
echo "🎉 Setup complete!"

