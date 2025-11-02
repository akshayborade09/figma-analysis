# Figma UX Analysis Automation Tool

> Automated UX analysis for Figma designs using Claude AI, analyzing accessibility, usability heuristics, design principles, and platform guidelines.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🎯 Overview

This tool provides **automated UX analysis** directly in Figma by combining:
- **Figma Plugin** - Select frames and trigger analysis
- **Cloudflare Worker** - Serverless backend for processing
- **Claude AI** - Advanced vision analysis using Anthropic's API
- **Figma REST API** - Export images and post feedback comments

## ✨ Features

### Analysis Frameworks
- ✅ **WCAG Accessibility** - Color contrast, touch targets, text sizing
- 🎯 **Nielsen's 10 Heuristics** - Usability best practices
- 🎨 **Gestalt Principles** - Visual perception and grouping
- 📱 **Platform Guidelines** - iOS HIG, Material Design, Web standards
- 📐 **UX Laws** - Fitts's, Hick's, Miller's, Jakob's laws

### Automated Workflow
1. Select frames in Figma
2. Configure analysis parameters
3. Plugin sends request to Cloudflare Worker
4. Worker exports frame images from Figma
5. Claude AI analyzes images against UX principles
6. Detailed feedback posted as Figma comments

## 📁 Project Structure

```
figma-ux-analysis/
├── figma-plugin/          # Figma plugin code
│   ├── code.ts            # Plugin logic (TypeScript)
│   ├── ui.html            # Plugin UI
│   ├── manifest.json      # Plugin manifest
│   ├── package.json       # Dependencies
│   └── tsconfig.json      # TypeScript config
│
├── cloudflare-worker/     # Serverless backend
│   ├── src/
│   │   └── index.js       # Worker logic
│   ├── package.json       # Dependencies
│   └── wrangler.toml      # Cloudflare config
│
├── shared/                # Shared utilities
│   ├── constants.js       # Shared constants
│   ├── types.ts           # TypeScript types
│   └── utils.js           # Utility functions
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Figma desktop app or browser
- Cloudflare account (free tier works)
- Anthropic API key ([get one here](https://console.anthropic.com/))
- Figma access token ([create one here](https://www.figma.com/developers/api#access-tokens))

### 1. Setup Cloudflare Worker

```bash
cd cloudflare-worker
npm install

# Configure secrets (don't commit these!)
npx wrangler secret put ANTHROPIC_API_KEY
# Paste your Anthropic API key

npx wrangler secret put FIGMA_ACCESS_TOKEN
# Paste your Figma access token

# Test locally
npm run dev

# Deploy to production
npm run deploy
```

After deployment, you'll get a URL like:
```
https://figma-ux-analyzer.your-account.workers.dev
```

### 2. Setup Figma Plugin

```bash
cd figma-plugin
npm install

# Build TypeScript
npm run build
```

**Install in Figma:**
1. Open Figma Desktop App
2. Go to **Plugins** → **Development** → **Import plugin from manifest**
3. Select `figma-plugin/manifest.json`
4. Plugin will appear in your plugins list

### 3. Configure Plugin

1. Open any Figma file
2. Run plugin: **Plugins** → **Development** → **UX Analysis Bot**
3. Enter your Cloudflare Worker URL
4. Click **Test Connection** to verify setup

## 📖 Usage

### Basic Workflow

1. **Select Frames**
   - Select one or more frames in Figma
   - Plugin shows count of selected frames

2. **Configure Analysis**
   - Choose design type (mobile, web, desktop, landing)
   - Select platform (iOS, Android, Web)
   - Enable/disable analysis frameworks

3. **Run Analysis**
   - Click "Analyze Frames"
   - Wait for processing (10-30 seconds per frame)
   - Check Figma comments for detailed feedback

### Configuration Options

**Design Type:**
- Mobile App
- Web Application  
- Desktop Application
- Landing Page

**Platform:**
- iOS (Human Interface Guidelines)
- Android (Material Design)
- Web (Best practices)

**Frameworks:**
- WCAG Accessibility ✓
- Nielsen's 10 Heuristics ✓
- Gestalt Principles ✓
- Platform Guidelines ✓
- UX Laws ✓

## 🔧 Development

### Figma Plugin Development

```bash
cd figma-plugin

# Watch mode for development
npm run dev

# Build for production
npm run build
```

**Hot reload:** After changes, re-run the plugin in Figma.

### Worker Development

```bash
cd cloudflare-worker

# Local development server
npm run dev

# View logs
npm run tail

# Deploy
npm run deploy
```

### Testing

**Test Worker Endpoint:**
```bash
curl -X POST https://your-worker.workers.dev \
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

## 🎨 Example Feedback

The tool posts structured comments like:

```
🔴 WCAG Accessibility (critical)

📍 Location: Primary CTA button at bottom

🔍 Finding: Text has contrast ratio of 2.8:1 against background, 
below WCAG AA minimum of 4.5:1

💡 Recommendation: Increase contrast by using #FFFFFF text on #0066FF 
background (7.2:1 ratio) or darken button to #003D99

📚 Principle: WCAG 1.4.3: Contrast (Minimum)
```

## 📊 Analysis Output

Each analysis provides:
- **10-15 specific findings** per frame
- **Severity levels**: Critical, High, Medium, Low
- **Positive feedback**: What's done well
- **Actionable recommendations**: Specific fixes
- **Principle references**: Linked to standards

## ⚙️ Configuration Files

### `wrangler.toml`
```toml
name = "figma-ux-analyzer"
main = "src/index.js"
compatibility_date = "2024-01-01"
workers_dev = true

[env.production]
name = "figma-ux-analyzer-prod"
```

### `manifest.json`
```json
{
  "name": "UX Analysis Bot",
  "id": "ux-analysis-bot",
  "api": "1.0.0",
  "main": "code.js",
  "ui": "ui.html",
  "editorType": ["figma"],
  "networkAccess": {
    "allowedDomains": ["*"]
  }
}
```

## 🔐 Security

- **API Keys**: Store in Cloudflare secrets (never commit)
- **CORS**: Worker has CORS enabled for Figma
- **Rate Limiting**: Built-in delays to respect API limits
- **Validation**: Input validation on all endpoints

### Environment Variables

**Cloudflare Worker (set via `wrangler secret`):**
- `ANTHROPIC_API_KEY` - Your Anthropic API key
- `FIGMA_ACCESS_TOKEN` - Your Figma access token

**Never commit:**
- API keys
- Access tokens
- Worker URLs (if not public)

## 📈 Pricing & Limits

### Anthropic Claude API
- $3 per million input tokens
- $15 per million output tokens
- Typical analysis: ~1,500 input + ~1,000 output tokens
- **Cost per frame: ~$0.02**

### Cloudflare Workers
- Free: 100,000 requests/day
- Paid: $5/month for 10M requests
- **This tool easily fits free tier**

### Figma API
- 150 requests per minute
- Worker includes rate limiting

## 🐛 Troubleshooting

### "Connection failed"
- Verify Worker URL is correct
- Check Worker is deployed (`wrangler deploy`)
- Test endpoint with curl

### "Missing API keys"
- Ensure secrets are set: `wrangler secret list`
- Re-add if missing: `wrangler secret put ANTHROPIC_API_KEY`

### "Failed to export image"
- Check Figma access token has read permissions
- Ensure file is saved (has fileKey)
- Verify frame IDs are valid

### No comments appear
- Check Figma access token has write permissions
- Look for errors in Worker logs (`wrangler tail`)
- Verify frame IDs match selection

### Rate limit errors
- Worker has 150ms delay between comments
- For bulk analysis, process frames sequentially
- Consider adding retry logic

## 🛠️ Advanced Usage

### Custom Prompts

Edit `cloudflare-worker/src/index.js` → `buildAnalysisPrompt()` to customize:
- Analysis depth
- Output format
- Framework weights
- Severity thresholds

### Additional Frameworks

Add new frameworks in `shared/constants.js`:
```javascript
export const CUSTOM_FRAMEWORK = {
  name: 'Your Framework',
  principles: [...]
};
```

Update prompt in `buildAnalysisPrompt()` to include new framework.

### Batch Processing

For analyzing 10+ frames:
- Process sequentially to avoid rate limits
- Add progress tracking in UI
- Consider webhook for async processing

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **Anthropic** - Claude AI vision capabilities
- **Figma** - Plugin API and REST API
- **Cloudflare** - Serverless Workers platform
- **Nielsen Norman Group** - Usability heuristics
- **W3C** - WCAG guidelines

## 📞 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- 📧 **Email**: support@example.com

## 🗺️ Roadmap

- [ ] Batch analysis optimization
- [ ] Custom rule configurations
- [ ] Export analysis reports (PDF/CSV)
- [ ] Comparison between frame versions
- [ ] Team collaboration features
- [ ] Integration with design systems
- [ ] Historical analysis tracking

## 📚 Resources

**UX Frameworks:**
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Nielsen's Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/)
- [Gestalt Principles](https://www.interaction-design.org/literature/topics/gestalt-principles)
- [Laws of UX](https://lawsofux.com/)

**APIs:**
- [Figma API Docs](https://www.figma.com/developers/api)
- [Anthropic Claude API](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)

**Platform Guidelines:**
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design 3](https://m3.material.io/)
- [Web Accessibility Initiative](https://www.w3.org/WAI/)

---

**Built with ❤️ for better UX**

