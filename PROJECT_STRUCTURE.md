# Project Structure

Complete overview of the Figma UX Analysis automation tool structure.

## 📁 Directory Tree

```
figma-ux-analysis/
│
├── 📄 README.md                    # Main documentation
├── 📄 QUICKSTART.md                # 5-minute setup guide
├── 📄 SETUP.md                     # Detailed setup instructions
├── 📄 ARCHITECTURE.md              # Technical architecture overview
├── 📄 CONTRIBUTING.md              # Contribution guidelines
├── 📄 CHANGELOG.md                 # Version history
├── 📄 LICENSE                      # MIT License
├── 📄 package.json                 # Root package (workspace commands)
├── 📄 .gitignore                   # Git ignore patterns
├── 📄 .cursorignore                # Cursor AI ignore patterns
│
├── 📂 figma-plugin/                # Figma Plugin
│   ├── code.ts                     # Plugin logic (TypeScript)
│   ├── ui.html                     # Plugin UI (HTML/CSS/JS)
│   ├── manifest.json               # Plugin manifest
│   ├── package.json                # Dependencies
│   └── tsconfig.json               # TypeScript config
│
├── 📂 cloudflare-worker/           # Cloudflare Worker
│   ├── src/
│   │   └── index.js                # Worker logic (JavaScript)
│   ├── package.json                # Dependencies
│   ├── package-lock.json           # Dependency lock
│   ├── wrangler.toml               # Cloudflare config
│   └── node_modules/               # Dependencies
│
└── 📂 shared/                      # Shared Utilities
    ├── constants.js                # Shared constants
    ├── types.ts                    # TypeScript types
    ├── utils.js                    # Utility functions
    └── package.json                # Package metadata
```

## 📝 File Descriptions

### Root Level

| File | Purpose |
|------|---------|
| `README.md` | Complete project documentation with overview, features, usage guide, troubleshooting |
| `QUICKSTART.md` | Get started in 5 minutes with minimal setup |
| `SETUP.md` | Step-by-step setup guide with prerequisites, API keys, deployment |
| `ARCHITECTURE.md` | Technical architecture, data flow, API interactions, extension points |
| `CONTRIBUTING.md` | Guidelines for contributing code, reporting bugs, suggesting features |
| `CHANGELOG.md` | Version history and release notes |
| `LICENSE` | MIT License text |
| `package.json` | Root package with workspace commands (`npm run setup`, etc.) |
| `.gitignore` | Git ignore patterns (node_modules, .env, logs, etc.) |
| `.cursorignore` | Cursor AI ignore patterns |

### Figma Plugin (`figma-plugin/`)

| File | Purpose | Lines |
|------|---------|-------|
| `code.ts` | Main plugin logic - handles frame selection, triggers analysis, communicates with Worker | ~180 |
| `ui.html` | Complete plugin UI with selection display, configuration options, status messages | ~450 |
| `manifest.json` | Plugin manifest with name, ID, API version, network access | ~11 |
| `package.json` | Dependencies: @figma/plugin-typings, typescript | ~15 |
| `tsconfig.json` | TypeScript compiler configuration | ~10 |

**Key Features:**
- Real-time frame selection tracking
- Configuration UI for design type, platform, frameworks
- Connection testing
- Progress indicators and status messages
- Local storage for Worker URL
- Error handling and user feedback

### Cloudflare Worker (`cloudflare-worker/`)

| File | Purpose | Lines |
|------|---------|-------|
| `src/index.js` | Complete worker logic - orchestrates analysis pipeline | ~436 |
| `package.json` | Dependencies: wrangler | ~32 |
| `wrangler.toml` | Cloudflare configuration, environment settings | ~10 |

**Key Functions:**
- `handleRequest()` - Main request handler with CORS
- `analyzeFrame()` - Single frame analysis orchestration
- `exportFrameImage()` - Export image from Figma API
- `downloadImageAsBase64()` - Convert image to base64
- `analyzeWithClaude()` - Send to Claude API for analysis
- `buildAnalysisPrompt()` - Construct analysis prompt
- `postCommentsToFigma()` - Post feedback comments
- `formatSummary()` - Format summary comment
- `formatComment()` - Format individual feedback
- `calculatePosition()` - Distribute comment positions

### Shared Utilities (`shared/`)

| File | Purpose | Lines |
|------|---------|-------|
| `constants.js` | Shared constants (frameworks, severity levels, API config) | ~100 |
| `types.ts` | TypeScript type definitions for shared data structures | ~80 |
| `utils.js` | Utility functions (validation, formatting, retries) | ~150 |
| `package.json` | Package metadata with exports | ~20 |

**Exports:**
- Analysis frameworks enum
- Design types and platforms
- Severity levels
- WCAG guidelines
- Nielsen's heuristics
- Gestalt principles
- UX laws
- API configuration
- Utility functions

## 🔄 Data Flow

```
1. User selects frames in Figma
   ↓
2. Plugin UI shows selection count
   ↓
3. User configures analysis options
   ↓
4. Plugin sends POST to Cloudflare Worker
   ↓
5. Worker exports images from Figma API
   ↓
6. Worker converts images to base64
   ↓
7. Worker sends to Claude API for analysis
   ↓
8. Claude returns structured feedback (JSON)
   ↓
9. Worker posts comments to Figma API
   ↓
10. Plugin shows success message
   ↓
11. User views comments in Figma
```

## 🚀 Quick Commands

### Setup
```bash
# Install all dependencies
npm run setup

# Or install individually
cd figma-plugin && npm install
cd cloudflare-worker && npm install
cd shared && npm install
```

### Development
```bash
# Plugin development (watch mode)
npm run dev:plugin
# OR: cd figma-plugin && npm run dev

# Worker development (local server)
npm run dev:worker
# OR: cd cloudflare-worker && npm run dev

# View Worker logs
npm run tail:worker
# OR: cd cloudflare-worker && npm run tail
```

### Build & Deploy
```bash
# Build plugin
npm run build:plugin
# OR: cd figma-plugin && npm run build

# Deploy Worker
npm run deploy:worker
# OR: cd cloudflare-worker && npm run deploy
```

## 📦 Dependencies

### Figma Plugin
- `@figma/plugin-typings` (^1.90.0) - Figma API type definitions
- `typescript` (^5.0.0) - TypeScript compiler

### Cloudflare Worker
- `wrangler` (^3.0.0) - Cloudflare CLI tool

### Shared
- None (pure JavaScript/TypeScript)

## 🔑 Environment Variables

**Cloudflare Worker Secrets:**
- `ANTHROPIC_API_KEY` - Claude API key
- `FIGMA_ACCESS_TOKEN` - Figma access token

**Set via:**
```bash
cd cloudflare-worker
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put FIGMA_ACCESS_TOKEN
```

**Verify:**
```bash
npx wrangler secret list
```

## 📊 Code Statistics

| Component | Files | Lines of Code | Language |
|-----------|-------|---------------|----------|
| Figma Plugin | 5 | ~650 | TypeScript, HTML, JSON |
| Cloudflare Worker | 3 | ~450 | JavaScript, TOML |
| Shared Utilities | 4 | ~350 | JavaScript, TypeScript |
| Documentation | 7 | ~2,500 | Markdown |
| **Total** | **19** | **~3,950** | - |

## 🎯 Key Features by Component

### Figma Plugin
✅ Frame selection UI  
✅ Real-time selection updates  
✅ Configuration options  
✅ Test connection feature  
✅ Progress indicators  
✅ Error handling  
✅ Local storage  
✅ Status messages  

### Cloudflare Worker
✅ Request handling  
✅ Image export from Figma  
✅ Base64 encoding  
✅ Claude API integration  
✅ Comment posting  
✅ Rate limiting  
✅ Error handling  
✅ Logging  
✅ CORS support  

### Shared Utilities
✅ Framework constants  
✅ Type definitions  
✅ Validation functions  
✅ Formatting utilities  
✅ Retry logic  
✅ Color contrast calculations  

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `figma-plugin/manifest.json` | Plugin name, ID, permissions |
| `figma-plugin/tsconfig.json` | TypeScript compilation settings |
| `cloudflare-worker/wrangler.toml` | Worker name, environment, secrets |
| `package.json` (root) | Workspace commands |
| `.gitignore` | Files to exclude from Git |

## 📚 Documentation

| Document | Size | Purpose |
|----------|------|---------|
| `README.md` | ~500 lines | Complete project guide |
| `QUICKSTART.md` | ~100 lines | Fast setup guide |
| `SETUP.md` | ~450 lines | Detailed step-by-step setup |
| `ARCHITECTURE.md` | ~600 lines | Technical deep dive |
| `CONTRIBUTING.md` | ~300 lines | Contribution guide |
| `CHANGELOG.md` | ~100 lines | Version history |

## 🌟 Notable Features

1. **Complete Implementation** - Fully functional from plugin to worker to API integrations
2. **Production Ready** - Error handling, logging, rate limiting
3. **Well Documented** - Comprehensive docs for users and developers
4. **Type Safe** - TypeScript types throughout
5. **Modular** - Shared utilities, clean separation of concerns
6. **Scalable** - Cloudflare Workers edge deployment
7. **Secure** - Secrets management, CORS configuration
8. **Developer Friendly** - Hot reload, logging, testing tools

## 🎨 Analysis Frameworks Included

✅ **WCAG Accessibility** - Color contrast, touch targets, text sizing  
✅ **Nielsen's 10 Heuristics** - Usability best practices  
✅ **Gestalt Principles** - Visual perception and grouping  
✅ **Platform Guidelines** - iOS HIG, Material Design, Web standards  
✅ **UX Laws** - Fitts's, Hick's, Miller's, Jakob's laws  

## 🚢 Deployment Checklist

- [ ] Install dependencies (`npm run setup`)
- [ ] Get Anthropic API key
- [ ] Get Figma access token
- [ ] Login to Cloudflare (`wrangler login`)
- [ ] Set Worker secrets
- [ ] Deploy Worker (`npm run deploy:worker`)
- [ ] Build plugin (`npm run build:plugin`)
- [ ] Import plugin to Figma
- [ ] Configure Worker URL in plugin
- [ ] Test connection
- [ ] Run first analysis

## 💡 Next Steps

1. **Setup** - Follow [SETUP.md](SETUP.md) for detailed instructions
2. **Quick Start** - Use [QUICKSTART.md](QUICKSTART.md) for fast setup
3. **Customize** - Read [CONTRIBUTING.md](CONTRIBUTING.md) to extend functionality
4. **Understand** - Review [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
5. **Use** - Follow [README.md](README.md) for usage guidelines

---

**Built with ❤️ for better UX**

