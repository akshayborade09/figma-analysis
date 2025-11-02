# Architecture Overview

This document explains how the Figma UX Analysis tool works under the hood.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FIGMA DESKTOP APP                        │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    UX Analysis Plugin                     │  │
│  │                                                            │  │
│  │  • Frame selection UI                                     │  │
│  │  • Configuration options                                  │  │
│  │  • Trigger analysis                                       │  │
│  │  • Display status                                         │  │
│  └────────────────┬─────────────────────────────────────────┘  │
│                   │                                              │
└───────────────────┼──────────────────────────────────────────────┘
                    │
                    │ HTTPS POST
                    │ (payload with frames)
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE WORKER                             │
│                   (Serverless Backend)                           │
│                                                                   │
│  1. Receive request                                              │
│  2. Validate payload                                             │
│  3. For each frame:                                              │
│     ├─► Export image from Figma API                             │
│     ├─► Convert to base64                                       │
│     ├─► Send to Claude API                                      │
│     ├─► Parse analysis results                                  │
│     └─► Post comments to Figma API                              │
│  4. Return summary response                                      │
│                                                                   │
└───┬─────────────────────────┬───────────────────────────────┬───┘
    │                         │                                 │
    │                         │                                 │
    ▼                         ▼                                 ▼
┌─────────┐          ┌──────────────┐              ┌──────────────┐
│ Figma   │          │   Claude     │              │   Figma      │
│   API   │          │     API      │              │     API      │
│         │          │              │              │              │
│ Export  │          │  Vision      │              │  Comments    │
│ Images  │          │  Analysis    │              │  Posting     │
└─────────┘          └──────────────┘              └──────────────┘
```

## Data Flow

### 1. Plugin → Worker

**Request:**
```json
{
  "fileKey": "abc123",
  "fileName": "My Design",
  "frameCount": 2,
  "frames": [
    {
      "id": "123:456",
      "name": "Login Screen",
      "width": 375,
      "height": 812
    }
  ],
  "config": {
    "designType": "mobile",
    "platform": "ios",
    "frameworks": {
      "accessibility": true,
      "heuristics": true,
      "gestalt": true,
      "platformGuidelines": true,
      "uxLaws": true
    }
  }
}
```

### 2. Worker → Figma Images API

**Request:**
```
GET https://api.figma.com/v1/images/{fileKey}?ids={nodeId}&format=png&scale=2
Headers:
  X-Figma-Token: {FIGMA_ACCESS_TOKEN}
```

**Response:**
```json
{
  "images": {
    "123:456": "https://s3.amazonaws.com/figma-temp/image.png"
  }
}
```

### 3. Worker → Claude API

**Request:**
```json
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 4096,
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "image",
          "source": {
            "type": "base64",
            "media_type": "image/png",
            "data": "iVBORw0KG..."
          }
        },
        {
          "type": "text",
          "text": "You are an expert UX auditor..."
        }
      ]
    }
  ]
}
```

**Response:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "[{\"location\":\"Primary button\",\"category\":\"WCAG\",\"severity\":\"high\",...}]"
    }
  ]
}
```

### 4. Worker → Figma Comments API

**Request:**
```json
{
  "message": "🔴 **WCAG Accessibility** _(high)_\n\n📍 **Location:** Primary button...",
  "client_meta": {
    "node_id": "123:456",
    "node_offset": { "x": 0.95, "y": 0.15 }
  }
}
```

### 5. Worker → Plugin

**Response:**
```json
{
  "success": true,
  "analyzed": 2,
  "failed": 0,
  "results": [
    {
      "frameId": "123:456",
      "frameName": "Login Screen",
      "success": true,
      "commentsPosted": 12
    }
  ],
  "message": "Analysis complete! Processed 2 frames."
}
```

## Components

### Figma Plugin (`figma-plugin/`)

**Files:**
- `code.ts` - Main plugin logic
- `ui.html` - User interface
- `manifest.json` - Plugin configuration

**Responsibilities:**
- Display UI for frame selection
- Collect configuration options
- Send analysis request to Worker
- Show progress and status messages
- Handle errors gracefully

**Key Functions:**
- `updateSelection()` - Track selected frames
- `handleStartAnalysis()` - Send request to Worker
- `handleTestConnection()` - Verify Worker connectivity

### Cloudflare Worker (`cloudflare-worker/`)

**Files:**
- `src/index.js` - Worker logic
- `wrangler.toml` - Cloudflare configuration

**Responsibilities:**
- Receive requests from plugin
- Export frame images from Figma
- Analyze images with Claude
- Post comments back to Figma
- Handle rate limiting and retries
- Log errors and metrics

**Key Functions:**
- `handleRequest()` - Main request handler
- `analyzeFrame()` - Single frame analysis
- `exportFrameImage()` - Get image from Figma
- `analyzeWithClaude()` - Send to Claude API
- `postCommentsToFigma()` - Post feedback
- `buildAnalysisPrompt()` - Construct prompt

### Shared Utilities (`shared/`)

**Files:**
- `constants.js` - Shared constants
- `types.ts` - TypeScript types
- `utils.js` - Utility functions

**Responsibilities:**
- Define shared constants
- Provide type definitions
- Utility functions for both plugin and worker

## API Interactions

### Figma REST API

**Endpoints Used:**

1. **Export Images**
   ```
   GET /v1/images/{file_key}
   ```
   - Exports frame as PNG
   - 2x scale for better quality
   - Returns temporary S3 URL

2. **Post Comments**
   ```
   POST /v1/files/{file_key}/comments
   ```
   - Creates comment on frame
   - Positions comment with offset
   - Supports markdown formatting

**Authentication:**
- Header: `X-Figma-Token: {token}`
- Token scope: Read files, Write comments

**Rate Limits:**
- 150 requests per minute
- Worker includes 150ms delays

### Claude API

**Endpoint:**
```
POST https://api.anthropic.com/v1/messages
```

**Authentication:**
- Header: `x-api-key: {key}`
- Header: `anthropic-version: 2023-06-01`

**Model:**
- `claude-sonnet-4-20250514`
- Vision model (image + text input)
- 4096 max output tokens

**Cost:**
- $3/1M input tokens (~1,500 per frame)
- $15/1M output tokens (~1,000 per frame)
- **~$0.02 per frame**

## Security

### Secrets Management

**Stored in Cloudflare:**
- `ANTHROPIC_API_KEY` - Claude API key
- `FIGMA_ACCESS_TOKEN` - Figma access token

**Set via Wrangler:**
```bash
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put FIGMA_ACCESS_TOKEN
```

**Never committed to git:**
- `.gitignore` excludes `.env` files
- Worker URL is public (contains no secrets)

### CORS

Worker enables CORS for Figma plugin:
```javascript
{
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}
```

## Performance

### Latency Breakdown

Per frame analysis:
- Export image: ~1-2s
- Download image: ~0.5-1s
- Claude analysis: ~5-10s
- Post comments (12): ~2-3s
- **Total: ~10-15s per frame**

### Optimizations

1. **Sequential processing** - Avoids rate limits
2. **Rate limiting delays** - 150ms between comments
3. **Base64 encoding** - Efficient image transfer
4. **Batch selection** - Analyze multiple frames in one request

### Scaling

- Worker scales automatically (Cloudflare)
- No server management needed
- Free tier: 100,000 requests/day
- Can handle 10,000+ analyses/day

## Error Handling

### Plugin Errors

- Connection failures → Show error message
- No frames selected → Disable analyze button
- Invalid config → Validate before sending

### Worker Errors

- Missing API keys → Return 500 error
- Figma export fails → Skip frame, continue
- Claude API error → Retry with backoff
- Comment post fails → Log error, continue

### Monitoring

```bash
# View real-time logs
npx wrangler tail

# Logs include:
# - Request details
# - Frame processing
# - API errors
# - Success/failure counts
```

## Extension Points

### Add New Framework

1. Define in `shared/constants.js`
2. Add checkbox in `ui.html`
3. Update prompt in `buildAnalysisPrompt()`
4. Update types in `shared/types.ts`

### Custom Comment Format

Edit `formatComment()` in `cloudflare-worker/src/index.js`:
- Change emoji icons
- Modify markdown structure
- Add/remove fields

### Change Claude Model

Update in `cloudflare-worker/src/index.js`:
```javascript
model: 'claude-opus-4-20250514' // More powerful
model: 'claude-haiku-4-20250514' // Faster, cheaper
```

### Add Export Format

Currently PNG, could add:
- SVG for vector export
- PDF for documentation
- JSON for data analysis

## Technology Stack

**Frontend:**
- TypeScript
- HTML/CSS
- Figma Plugin API

**Backend:**
- JavaScript (ES modules)
- Cloudflare Workers
- Edge computing

**APIs:**
- Figma REST API
- Anthropic Claude API
- Native fetch

**Infrastructure:**
- Cloudflare global network
- Edge caching
- Automatic SSL

## Development Workflow

1. **Plugin development:**
   ```bash
   cd figma-plugin
   npm run dev  # Watch mode
   ```

2. **Worker development:**
   ```bash
   cd cloudflare-worker
   npm run dev  # Local server
   ```

3. **Testing:**
   - Manual testing in Figma
   - curl for Worker endpoint
   - Logs via `wrangler tail`

4. **Deployment:**
   ```bash
   npm run deploy
   ```

---

**Questions?** See [CONTRIBUTING.md](CONTRIBUTING.md) or open an issue!

