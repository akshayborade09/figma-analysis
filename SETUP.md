# Setup Guide

Complete step-by-step setup instructions for the Figma UX Analysis tool.

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] Node.js 16+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Figma desktop app or access to Figma in browser
- [ ] A Cloudflare account (free tier is fine)
- [ ] An Anthropic account with API access
- [ ] A Figma account with access to create access tokens

## 🔑 Step 1: Get API Keys

### Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **Create Key**
5. Copy and save the key securely
6. ⚠️ Note: This key is shown only once!

**Pricing:** $3/million input tokens, $15/million output tokens (~$0.02 per frame)

### Figma Access Token

1. Go to [figma.com/developers/api#access-tokens](https://www.figma.com/developers/api#access-tokens)
2. Log in to Figma
3. Go to **Settings** → **Account** → **Personal Access Tokens**
4. Click **Create new token**
5. Name it "UX Analysis Bot"
6. Copy and save the token securely
7. ⚠️ Keep this private - it has full access to your files!

## 🚀 Step 2: Deploy Cloudflare Worker

### Install Wrangler CLI

```bash
cd cloudflare-worker
npm install
```

### Login to Cloudflare

```bash
npx wrangler login
```

This opens a browser window to authorize Wrangler.

### Configure Secrets

**Important:** Never commit API keys to git!

```bash
# Set Anthropic API key
npx wrangler secret put ANTHROPIC_API_KEY
# When prompted, paste your Anthropic API key

# Set Figma access token
npx wrangler secret put FIGMA_ACCESS_TOKEN
# When prompted, paste your Figma access token
```

Verify secrets are set:
```bash
npx wrangler secret list
```

### Test Locally

```bash
npm run dev
```

This starts a local server at `http://localhost:8787`

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
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Deploy to Production

```bash
npm run deploy
```

After deployment, you'll see:
```
Published figma-ux-analyzer (X.XX sec)
  https://figma-ux-analyzer.your-account.workers.dev
```

**Copy this URL** - you'll need it for the plugin!

### Verify Deployment

```bash
curl -X POST https://figma-ux-analyzer.your-account.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

## 🔌 Step 3: Install Figma Plugin

### Build Plugin

```bash
cd figma-plugin
npm install
npm run build
```

This compiles `code.ts` → `code.js`

### Import to Figma Desktop

1. Open **Figma Desktop App** (plugin development requires desktop app)
2. Go to **Menu** → **Plugins** → **Development** → **Import plugin from manifest...**
3. Navigate to `figma-ux-analysis/figma-plugin/`
4. Select `manifest.json`
5. Click **Open**

The plugin is now installed in development mode!

### Verify Installation

1. Open any Figma file (or create a new one)
2. Go to **Menu** → **Plugins** → **Development**
3. You should see **"UX Analysis Bot"**
4. Click to run it

## ⚙️ Step 4: Configure Plugin

### First Run Setup

1. Run the plugin from **Plugins** → **Development** → **UX Analysis Bot**
2. In the Worker URL field, paste your Cloudflare Worker URL:
   ```
   https://figma-ux-analyzer.your-account.workers.dev
   ```
3. Click **Test Connection**
4. You should see: ✅ **Connection successful!**

If connection fails, check:
- Worker URL is correct
- Worker is deployed (`wrangler deployments list`)
- Secrets are set (`wrangler secret list`)

### Save Configuration

The plugin automatically saves your Worker URL in localStorage, so you only need to configure it once per browser/device.

## 🎨 Step 5: Run Your First Analysis

### Create Test Frame

1. Create a new Figma file or open existing one
2. Press `F` to create a frame
3. Choose a preset (e.g., "iPhone 14 Pro")
4. Add some UI elements (buttons, text, inputs)
5. Name your frame (e.g., "Login Screen")

### Run Analysis

1. Select your frame
2. Open plugin: **Plugins** → **Development** → **UX Analysis Bot**
3. Verify frame is selected (should show "1 frames selected")
4. Configure:
   - Design Type: **Mobile App**
   - Platform: **iOS**
   - Leave all frameworks checked
5. Click **🚀 Analyze Frames**

### View Results

1. Wait 10-30 seconds for analysis
2. You'll see success message: "Analysis complete!"
3. Check Figma comments (💬 icon in toolbar)
4. Comments should appear on your frame with detailed feedback

## 🔍 Step 6: Verify Everything Works

### Checklist

- [ ] Worker deployed successfully
- [ ] Test endpoint returns success
- [ ] Plugin appears in Figma
- [ ] Connection test succeeds
- [ ] Frame analysis completes
- [ ] Comments appear in Figma

### Common Issues

**"Connection failed"**
- Verify Worker URL is correct (no trailing slash)
- Check Worker logs: `npx wrangler tail`
- Test with curl to isolate issue

**"Missing API keys"**
- Run: `npx wrangler secret list`
- Should show both ANTHROPIC_API_KEY and FIGMA_ACCESS_TOKEN
- Re-add if missing

**"Failed to export image"**
- Ensure Figma access token is valid
- Check file is saved (has fileKey)
- Verify frame exists and is selected

**No comments appear**
- Check Worker logs for errors
- Verify Figma token has write permissions
- Look for rate limit messages

## 📊 Step 7: Test All Features

### Test Different Configurations

1. **Mobile iOS**
   - Create iPhone frame
   - Select platform: iOS
   - Run analysis
   - Check for iOS-specific guidelines

2. **Android**
   - Create Android frame
   - Select platform: Android
   - Run analysis
   - Check for Material Design feedback

3. **Web**
   - Create desktop frame (1440x900)
   - Select design type: Web Application
   - Select platform: Web
   - Run analysis

### Test Multiple Frames

1. Create 3 different frames
2. Select all 3 (Shift+Click)
3. Run analysis
4. Verify all frames get comments

### Test Framework Toggles

1. Uncheck some frameworks
2. Run analysis
3. Verify comments only reference enabled frameworks

## 🎓 Step 8: Learn Best Practices

### Frame Naming

Good names help Claude understand context:
- ✅ "Login Screen - Mobile"
- ✅ "Product Detail Page"
- ✅ "Checkout Flow - Step 2"
- ❌ "Frame 1"
- ❌ "Untitled"

### Design Preparation

For best results:
- Use actual content (not Lorem Ipsum)
- Include realistic data
- Show complete flows
- Use proper components
- Apply real colors and spacing

### Analysis Frequency

Run analysis:
- ✅ After major design changes
- ✅ Before design reviews
- ✅ When exploring new patterns
- ✅ For client presentations
- ❌ Not for every tiny tweak (costs API credits)

## 💰 Step 9: Monitor Costs

### Check Cloudflare Usage

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages**
3. Click on your worker
4. View **Metrics** tab
5. Monitor requests/day

Free tier: 100,000 requests/day (plenty for this tool)

### Check Anthropic Usage

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Navigate to **Usage** section
3. View API costs

Typical costs:
- 1 frame analysis: ~$0.02
- 100 frames: ~$2.00
- 1000 frames: ~$20.00

### Set Budget Alerts

**Cloudflare:**
- Workers free tier should be sufficient
- Paid plan ($5/month) if you exceed free tier

**Anthropic:**
- Set up billing alerts in console
- Monitor usage dashboard
- Consider rate limiting for production

## 🔒 Step 10: Security Review

### Secrets Checklist

- [ ] API keys stored in Wrangler secrets (not in code)
- [ ] `.env` file in `.gitignore`
- [ ] No secrets in git history
- [ ] Access tokens not shared publicly
- [ ] Worker URL can be public (has no secrets)

### Access Control

- Figma token: Only you can use it
- Worker: Publicly accessible but rate-limited
- Claude API: Usage tied to your account

### Rotate Secrets

If compromised:
1. Generate new Figma token
2. Generate new Anthropic key
3. Update secrets: `wrangler secret put KEY_NAME`
4. Delete old tokens/keys

## 🎉 You're All Set!

### Next Steps

1. **Analyze your designs**: Run on real projects
2. **Customize prompts**: Edit analysis frameworks
3. **Share with team**: Deploy plugin to organization
4. **Iterate on feedback**: Use insights to improve designs

### Get Help

- 📖 Read full [README.md](README.md)
- 🐛 Report issues on GitHub
- 💬 Join discussions
- 📧 Contact support

### Advanced Features

Once comfortable with basics:
- Custom analysis prompts
- Batch processing automation
- Export reports
- Design system integration
- Team collaboration features

---

**Happy analyzing! 🚀**

