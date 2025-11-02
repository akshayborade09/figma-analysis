# Deployment Guide

Complete step-by-step deployment guide for the Figma UX Analysis automation tool.

## 📋 Pre-Deployment Checklist

### Prerequisites
- [ ] Node.js 16+ installed
- [ ] npm 7+ installed
- [ ] Cloudflare account (free tier works)
- [ ] Anthropic API key
- [ ] Figma access token
- [ ] Figma Desktop app (for plugin)

### API Keys Ready
- [ ] Anthropic API key obtained
- [ ] Figma access token created
- [ ] Both keys saved securely

## 🚀 Deployment Steps

### Step 1: Install Dependencies

```bash
# Install all dependencies
npm run setup

# Or install individually
cd cloudflare-worker && npm install
cd ../figma-plugin && npm install
```

### Step 2: Deploy Cloudflare Worker

#### 2.1 Login to Cloudflare
```bash
cd cloudflare-worker
npx wrangler login
```

This opens browser window for authorization.

#### 2.2 Set Secrets

**Option A: Use Setup Script (Recommended)**
```bash
chmod +x setup-secrets.sh
./setup-secrets.sh
```

**Option B: Manual Setup**
```bash
# Set Anthropic API key
npx wrangler secret put ANTHROPIC_API_KEY
# Paste your key when prompted

# Set Figma access token
npx wrangler secret put FIGMA_ACCESS_TOKEN
# Paste your token when prompted
```

#### 2.3 Test Locally
```bash
npm run dev
```

Opens local server at `http://localhost:8787`

**Test the endpoint:**
```bash
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

Expected response:
```json
{
  "status": "ok",
  "message": "Connection successful!",
  "timestamp": "2025-10-30T12:00:00.000Z"
}
```

#### 2.4 Deploy to Production
```bash
npm run deploy
```

**Save the Worker URL!** You'll see:
```
Published figma-ux-analyzer (X.XX sec)
  https://figma-ux-analyzer.your-account.workers.dev
```

**Copy this URL** - you'll need it for the plugin.

#### 2.5 Verify Deployment
```bash
# Test live endpoint
curl -X POST https://figma-ux-analyzer.your-account.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

#### 2.6 View Logs
```bash
npm run tail
```

Keeps logs open in real-time.

### Step 3: Build & Install Figma Plugin

#### 3.1 Update Worker URL

Edit `figma-plugin/code.ts` (lines 7-8):
```typescript
const N8N_WEBHOOK_URL = 'https://your-n8n-webhook-url.com';
const DEFAULT_WORKER_URL = 'https://figma-ux-analyzer.YOUR-ACCOUNT.workers.dev';
```

Replace `YOUR-ACCOUNT` with your actual Cloudflare account subdomain.

#### 3.2 Build Plugin
```bash
cd figma-plugin
npm run build
```

This compiles `code.ts` → `code.js`

#### 3.3 Import to Figma

1. Open **Figma Desktop App**
2. Go to **Menu** → **Plugins** → **Development** → **Import plugin from manifest...**
3. Navigate to `figma-ux-analysis/figma-plugin/`
4. Select `manifest.json`
5. Click **Open**

Plugin is now installed!

### Step 4: Test End-to-End

#### 4.1 Create Test Frame
1. Open or create a Figma file
2. Press `F` to create frame
3. Choose "iPhone 14 Pro" preset
4. Add some UI elements (buttons, text)
5. Name frame "Test Screen"

#### 4.2 Run Plugin
1. Select your test frame
2. Go to **Plugins** → **Development** → **UX Analysis Bot**
3. Plugin opens

#### 4.3 Configure Plugin
1. Verify Worker URL is correct
2. Click "Test Connection"
3. Should see: ✅ "Connection successful!"

#### 4.4 Run Analysis
1. With frame still selected
2. Click "Analyze Selected Frames"
3. Wait 15-30 seconds
4. Check Figma comments (💬 icon in toolbar)

**Success indicators:**
- Green success message in plugin
- Comments appear on your frame
- Summary comment with statistics
- Individual feedback comments

## 🐛 Troubleshooting Deployment

### Worker Deployment Issues

#### "Not logged in"
```bash
wrangler login
```

#### "Missing secrets"
```bash
# List current secrets
wrangler secret list

# Re-add missing secrets
./setup-secrets.sh
```

#### "Deployment failed"
```bash
# Check syntax errors
npm run dev

# View detailed logs
wrangler deployments list
```

#### "Wrong account"
```bash
# Logout and login again
wrangler logout
wrangler login
```

### Plugin Build Issues

#### "Cannot find name 'figma'"
```bash
# Normal during build - ignore
# These resolve when plugin runs in Figma
```

#### "Module not found"
```bash
cd figma-plugin
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### "TypeScript errors"
```bash
# Check tsconfig.json exists
# Reinstall @figma/plugin-typings
npm install --save-dev @figma/plugin-typings@latest
```

### Connection Issues

#### "Connection failed" in plugin
- Verify Worker URL is correct (no trailing slash)
- Check Worker is deployed: `wrangler deployments list`
- Test with curl
- Check CORS is enabled in Worker

#### "Missing API keys"
```bash
# Verify secrets exist
cd cloudflare-worker
wrangler secret list

# Should show:
# ANTHROPIC_API_KEY
# FIGMA_ACCESS_TOKEN
```

#### "Failed to export image"
- Check Figma token has read permissions
- Ensure file is saved (has fileKey)
- Verify frame exists

#### "Claude API error"
- Verify API key is correct
- Check API key has credits
- View usage: https://console.anthropic.com/

### Plugin Runtime Issues

#### "Could not get file key"
- Save the file first (Cmd+S / Ctrl+S)
- File must be saved to Figma cloud

#### "No comments appear"
- Check Worker logs: `npm run tail`
- Verify Figma token has write permissions
- Check for rate limit errors

## 📊 Monitoring & Logs

### View Worker Logs
```bash
cd cloudflare-worker
npm run tail

# Keep running to see live logs
```

### Check Cloudflare Dashboard
1. Go to https://dash.cloudflare.com
2. Navigate to **Workers & Pages**
3. Click on your worker
4. View **Metrics** tab

**Metrics to monitor:**
- Requests per day
- Success rate
- Errors
- Response time

### Check Anthropic Usage
1. Go to https://console.anthropic.com/
2. Navigate to **Usage**
3. View API costs

**Typical costs:**
- 1 frame: ~$0.02
- 10 frames: ~$0.20
- 100 frames: ~$2.00

### Set Up Alerts

**Cloudflare Workers (Free tier: 100k requests/day)**
- Monitor daily request count
- Set up email alerts

**Anthropic API**
- Set billing alerts in console
- Monitor daily spending
- Set spending limits

## 🔄 Update & Rollback

### Update Worker
```bash
cd cloudflare-worker

# Pull latest changes
git pull

# Deploy update
npm run deploy
```

### Update Plugin
```bash
cd figma-plugin

# Pull latest changes
git pull

# Rebuild
npm run build

# Re-run plugin in Figma (no re-import needed)
```

### Rollback Worker
```bash
# View deployments
wrangler deployments list

# Rollback to previous version
wrangler rollback --message "Rolling back to previous version"
```

### View Deployment History
```bash
wrangler deployments list
```

## 🔐 Security Best Practices

### Secrets Management
- ✅ Never commit API keys to git
- ✅ Use wrangler secrets (encrypted)
- ✅ Rotate keys periodically
- ✅ Use different keys for dev/prod

### Access Control
- ✅ Limit Figma token scope (read files, write comments)
- ✅ Don't share Worker URL publicly
- ✅ Monitor unusual activity

### Key Rotation
```bash
# Generate new keys
# Update secrets
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put FIGMA_ACCESS_TOKEN

# Deploy (optional, secrets update live)
npm run deploy
```

## 📈 Scaling Considerations

### Free Tier Limits

**Cloudflare Workers (Free)**
- 100,000 requests/day
- 10ms CPU time per request
- Plenty for this tool

**Anthropic Claude**
- Pay-per-use
- ~$0.02 per frame
- Set spending limits

### Paid Tier Benefits

**Cloudflare Workers ($5/month)**
- 10M requests/month
- Faster CPU time
- Better analytics

**If Needed:**
- Add rate limiting per user
- Implement caching
- Queue long-running analyses

## 🎯 Production Checklist

### Pre-Launch
- [ ] Worker deployed successfully
- [ ] Secrets configured
- [ ] Plugin built and installed
- [ ] End-to-end test passed
- [ ] Logs monitored
- [ ] Error handling verified
- [ ] Documentation updated

### Post-Launch
- [ ] Monitor Cloudflare metrics
- [ ] Track Anthropic costs
- [ ] Collect user feedback
- [ ] Watch for errors in logs
- [ ] Update as needed

## 📞 Support & Resources

### Cloudflare Workers
- Docs: https://developers.cloudflare.com/workers/
- Dashboard: https://dash.cloudflare.com/
- Status: https://www.cloudflarestatus.com/

### Anthropic Claude
- Docs: https://docs.anthropic.com/
- Console: https://console.anthropic.com/
- Pricing: https://www.anthropic.com/pricing

### Figma API
- Docs: https://www.figma.com/developers/api
- Plugin API: https://www.figma.com/plugin-docs/

## 🎉 Success Indicators

Your deployment is successful when:
- ✅ Worker responds to test requests
- ✅ Plugin connects to Worker
- ✅ Analysis completes for test frames
- ✅ Comments appear in Figma
- ✅ Logs show no errors
- ✅ Costs are within budget

---

**Need help?** Check logs, review troubleshooting, or open an issue!

