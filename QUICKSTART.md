# Quick Start Guide

Get up and running in 5 minutes! ⚡

## Prerequisites

- Node.js 16+
- Cloudflare account
- Anthropic API key
- Figma access token

## 1. Install Dependencies

```bash
# Install all dependencies
npm run setup

# Or manually
cd figma-plugin && npm install
cd ../cloudflare-worker && npm install
```

## 2. Setup Cloudflare Worker

```bash
cd cloudflare-worker

# Login to Cloudflare
npx wrangler login

# Add secrets (paste when prompted)
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put FIGMA_ACCESS_TOKEN

# Deploy
npm run deploy
```

**Copy the Worker URL** from deployment output!

## 3. Install Figma Plugin

```bash
cd figma-plugin

# Build plugin
npm run build
```

In Figma Desktop:
1. **Plugins** → **Development** → **Import plugin from manifest**
2. Select `figma-plugin/manifest.json`

## 4. Configure & Test

1. Open any Figma file
2. Run plugin: **Plugins** → **Development** → **UX Analysis Bot**
3. Paste your Worker URL
4. Click **Test Connection**
5. Should see: ✅ Connection successful!

## 5. Run First Analysis

1. Create a frame (press `F`)
2. Add some UI elements
3. Select the frame
4. Click **🚀 Analyze Frames**
5. Wait ~15 seconds
6. View comments (💬 icon)

## Troubleshooting

### Connection Failed
```bash
# Check Worker status
cd cloudflare-worker
npx wrangler tail
```

### No Comments Appear
- Verify Figma token has write permissions
- Check Worker logs for errors
- Ensure frame is selected

### API Errors
```bash
# Verify secrets are set
npx wrangler secret list
```

## Next Steps

- Read [SETUP.md](SETUP.md) for detailed instructions
- Check [README.md](README.md) for full documentation
- Review [CONTRIBUTING.md](CONTRIBUTING.md) to customize

---

**Need help?** Open an issue on GitHub!

