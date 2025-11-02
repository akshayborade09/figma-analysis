# Figma UX Analysis Plugin

Enhanced plugin with dual analysis modes and comprehensive metadata collection.

## 🎯 Features

### ✅ All Requested Features Implemented

1. **UI Dimensions**: 420 x 600px
2. **Real-Time Selection Detection**: Updates on every selection change
3. **Comprehensive Webhook Payload**: File, frame, user, and config data
4. **Dual Analysis Modes**:
   - Analyze Selected Frames
   - Analyze Current Page (all top-level frames)
5. **Selection Change Listener**: Live count updates
6. **Full Configuration Options**:
   - Design type (mobile, web, dashboard, etc.)
   - Platform (iOS, Android, Web)
   - Analysis frameworks (5 checkboxes)
7. **Status Messages**: Success, error, and progress indicators
8. **Validation**: Ensures frames selected before analysis
9. **Network Error Handling**: Graceful error messages
10. **Test Connection**: Verify Worker/Webhook availability
11. **Auto-Close Option**: Optional plugin close after submission

## 📦 Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Build Plugin
```bash
npm run build
```

This compiles `code.ts` → `code.js`

### 3. Import to Figma
1. Open **Figma Desktop App**
2. Go to **Plugins** → **Development** → **Import plugin from manifest**
3. Select `manifest.json` from this directory
4. Plugin appears in **Plugins** → **Development** → **UX Analysis Bot**

## 🔧 Configuration

### Update Webhook URLs (code.ts lines 7-8)
```typescript
const N8N_WEBHOOK_URL = 'https://your-n8n-webhook-url.com';
const DEFAULT_WORKER_URL = 'https://your-worker.workers.dev';
```

**Or** configure via UI (saved in localStorage)

## 🚀 Usage

### 1. Run Plugin
- Open any Figma file
- **Plugins** → **Development** → **UX Analysis Bot**

### 2. Select Frames
- Select one or more frames
- Or use "Analyze Page" for all frames

### 3. Configure Analysis
- Choose design type
- Select platform
- Enable/disable frameworks
- Enter Worker URL (if not using default)

### 4. Test Connection (Optional)
- Click "Test Connection"
- Verifies Worker/Webhook is accessible

### 5. Run Analysis
- Click "Analyze Selected Frames" (if frames selected)
- Or "Analyze Current Page" (for all page frames)
- Wait for status message

## 📤 Payload Structure

### Sent to Worker/Webhook
```json
{
  "fileKey": "abc123...",
  "fileName": "My Design File",
  "fileUrl": "https://figma.com/file/abc123...",
  "pageName": "Page 1",
  "pageId": "0:1",
  "frameCount": 3,
  "analysisType": "selected",
  "frames": [
    {
      "id": "123:456",
      "name": "Login Screen",
      "width": 375,
      "height": 812,
      "x": 0,
      "y": 0
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
  },
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "id": "figma-user-id",
    "timestamp": "2025-10-30T12:00:00.000Z"
  }
}
```

## 🔔 Status Messages

### Success
- 🔄 "Starting analysis..."
- ✅ "Analysis complete! X frames analyzed"
- ✅ "Analysis started! Comments in 1-3 minutes"

### Error
- ⚠️ "No frames selected"
- ⚠️ "No frames found on current page"
- ❌ "Analysis failed: [error]"
- ❌ "Server returned 500: [details]"

### Test Connection
- "Testing connection..."
- ✅ "Connection successful!"
- ❌ "Connection failed: [error]"

## 🎨 UI Features

### Real-Time Updates
- Selection count badge
- Page frame count
- Live frame list display

### Validation
- Disables "Analyze Selected" when no selection
- Validates file is saved before analysis
- Checks Worker URL before sending

### Error Handling
- Network errors caught gracefully
- Displays user-friendly error messages
- Shows both notifications and UI messages

## 🧪 Testing

### Test Mode
```typescript
// In code.ts, test without sending to worker:
console.log('📤 Payload:', payload);
// Comment out fetch() call temporarily
```

### Manual Test
1. Select a frame
2. Open browser console (DevTools)
3. Click "Analyze Selected Frames"
4. Check console for payload
5. Check network tab for request

### Connection Test
1. Click "Test Connection"
2. Should see green success message
3. If fails, check Worker URL

## 🐛 Troubleshooting

### "Cannot find name 'figma'"
- Expected during development
- Resolves when built and run in Figma
- Make sure `@figma/plugin-typings` is installed

### "No frames selected"
- Select at least one frame
- Or use "Analyze Current Page"

### "Could not get file key"
- Save the file first (Cmd+S / Ctrl+S)
- File must be saved to Figma cloud

### Network errors
- Check Worker URL is correct
- Verify Worker is deployed
- Test with "Test Connection" button
- Check CORS settings on Worker

### Build errors
```bash
# Clean and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📝 Development

### File Structure
```
figma-plugin/
├── code.ts           # Plugin logic (THIS FILE)
├── ui.html           # Plugin UI
├── manifest.json     # Plugin manifest
├── package.json      # Dependencies
├── tsconfig.json     # TypeScript config
└── README.md         # This file
```

### Watch Mode
```bash
npm run dev
```

Rebuilds on file changes. Re-run plugin in Figma to see changes.

### Message Flow
```
UI (ui.html)
  ↓ postMessage
Plugin (code.ts)
  ↓ fetch
Worker/Webhook
  ↓ response
Plugin
  ↓ postMessage
UI (shows result)
```

## 🔐 Security Notes

- User email collected from Figma (not editable)
- Worker URL configurable (can use different endpoint)
- No API keys stored in plugin
- All sensitive data handled by Worker

## 🎛️ Advanced Options

### Auto-Close Plugin
Uncomment in `code.ts` line 300:
```typescript
setTimeout(() => {
  figma.closePlugin(); // Uncomment to enable
}, 2000);
```

### Custom Analysis Types
Add new analysis types in `code.ts`:
```typescript
analysisType: 'selected' | 'page' | 'custom'
```

### Additional Metadata
Add to `AnalysisPayload` interface:
```typescript
interface AnalysisPayload {
  // ... existing fields
  customField: string;
}
```

## 📊 Message Types

### Plugin → UI
- `selection-updated` - Selection changed
- `page-frames-updated` - Page frames updated
- `initial-data` - User and file data
- `test-started/success/failed` - Connection test
- `analysis-started/complete/error` - Analysis status
- `error` - General errors

### UI → Plugin
- `analyze-selected` - Analyze selected frames
- `analyze-page` - Analyze all page frames
- `test-connection` - Test Worker connection
- `get-initial-data` - Request initial data
- `cancel` - Close plugin

## 🚢 Deployment Checklist

- [ ] Update `N8N_WEBHOOK_URL` or `DEFAULT_WORKER_URL`
- [ ] Install dependencies (`npm install`)
- [ ] Build plugin (`npm run build`)
- [ ] Import to Figma (Development menu)
- [ ] Test connection
- [ ] Test with sample frames
- [ ] Verify payload structure
- [ ] Check error handling
- [ ] Test both analysis modes

## 📚 Resources

- [Figma Plugin API](https://www.figma.com/plugin-docs/)
- [TypeScript Types](https://www.figma.com/plugin-docs/typescript/)
- [Plugin Development](https://www.figma.com/plugin-docs/setup/)

## 🆘 Support

Issues? Check:
1. Worker is deployed
2. Worker URL is correct
3. File is saved
4. Frames are selected (or using page mode)
5. Console for detailed errors

---

**All features implemented and ready to use! 🎉**

