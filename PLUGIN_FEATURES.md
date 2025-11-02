# Figma Plugin - Feature Documentation

Complete overview of the enhanced Figma UX Analysis plugin features.

## 🎨 Plugin Code (`code.ts`)

### ✅ All Requested Features Implemented

## 1. UI Configuration ✅
```typescript
figma.showUI(__html__, { 
  width: 420,      // As requested
  height: 600,     // As requested
  themeColors: true 
});
```

## 2. Real-Time Frame Detection ✅

### Selected Frames Tracking
```typescript
figma.on('selectionchange', () => {
  updateSelection();
});
```

**Updates sent to UI:**
- Frame ID, name, dimensions (width, height)
- Frame position (x, y coordinates)
- Real-time count updates

### Page-Level Frames
```typescript
function updatePageFrames() {
  currentPageFrames = figma.currentPage.children.filter(
    node => node.type === 'FRAME'
  ) as FrameNode[];
}
```

## 3. Webhook Payload ✅

### Complete Payload Structure
```typescript
interface AnalysisPayload {
  // File Information
  fileKey: string;           // Figma file ID
  fileName: string;          // File name
  fileUrl: string;           // Full Figma URL
  pageName: string;          // Current page name
  pageId: string;            // Page ID
  
  // Analysis Info
  frameCount: number;        // Number of frames
  analysisType: 'selected' | 'page';
  
  // Frame Data
  frames: [{
    id: string;              // Frame node ID
    name: string;            // Frame name
    width: number;           // Frame width (rounded)
    height: number;          // Frame height (rounded)
    x: number;               // X position
    y: number;               // Y position
  }];
  
  // Configuration
  config: {
    designType: string;      // mobile app, web app, etc.
    platform: string;        // iOS, Android, Web
    frameworks: {
      accessibility: boolean;
      heuristics: boolean;
      gestalt: boolean;
      platformGuidelines: boolean;
      uxLaws: boolean;
    }
  };
  
  // User Metadata
  user: {
    name: string;            // User's name
    email: string;           // User's email
    id: string;              // Figma user ID
    timestamp: string;       // ISO timestamp
  };
}
```

## 4. Button Options ✅

### Two Analysis Modes

#### Analyze Selected Frames
```typescript
case 'analyze-selected':
  await handleAnalyzeSelected(msg.config, msg.userInfo);
```
- Only enabled when frames are selected
- Validates selection before proceeding
- Sends only selected frames

#### Analyze Current Page
```typescript
case 'analyze-page':
  await handleAnalyzePage(msg.config, msg.userInfo);
```
- Analyzes all top-level frames on page
- Independent of selection
- Shows page frame count

## 5. Selection Change Listener ✅

### Real-Time Updates
```typescript
figma.on('selectionchange', () => {
  updateSelection();
});
```

**Sends to UI:**
```typescript
{
  type: 'selection-updated',
  frames: [...], // Frame data array
  count: number  // Selection count
}
```

## 6. Configuration Options ✅

### From UI
- ✅ Design Type (mobile app, web app, dashboard, landing, etc.)
- ✅ Platform (iOS, Android, Web, Responsive)
- ✅ Frameworks (all 5 checkboxes)
- ✅ Worker URL (configurable)
- ✅ User Info (name, email - optional)

## 7. Status Messages ✅

### Success States
```typescript
// Analysis started
"🔄 Starting analysis..."

// Analysis complete (immediate)
"✅ Analysis complete! X frames analyzed, Y failed."

// Analysis queued (async)
"✅ Analysis started! Comments will appear in 1-3 minutes."
```

### Error States
```typescript
// No selection
"⚠️ No frames selected"

// No page frames
"⚠️ No frames found on current page"

// API errors
"❌ Analysis failed: [error message]"

// Connection errors
"❌ Server returned 500: [error details]"
```

### Test Connection
```typescript
// Testing
"Testing connection..."

// Success
"✅ Connection successful!"

// Failed
"❌ Connection failed: [error message]"
```

## 8. Validation ✅

### Frame Selection Validation
```typescript
if (selectedFrames.length === 0) {
  figma.notify('⚠️ No frames selected', { error: true });
  figma.ui.postMessage({
    type: 'analysis-error',
    message: 'Please select at least one frame'
  });
  return;
}
```

### Page Frames Validation
```typescript
if (currentPageFrames.length === 0) {
  figma.notify('⚠️ No frames found on current page', { error: true });
  return;
}
```

### File Key Validation
```typescript
if (!fileMetadata.fileKey) {
  throw new Error('Could not get file key. Please save the file first.');
}
```

## 9. Network Error Handling ✅

### Graceful Error Handling
```typescript
try {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Server returned ${response.status}: ${errorText}`);
  }
  
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  
  figma.ui.postMessage({
    type: 'analysis-error',
    message: errorMessage
  });
  
  figma.notify(`❌ Analysis failed: ${errorMessage}`, { 
    error: true,
    timeout: 5000 
  });
}
```

## 10. Selection Count Badge ✅

### Real-Time Count Updates
```typescript
figma.ui.postMessage({
  type: 'selection-updated',
  count: selectedFrames.length  // Updates in real-time
});

figma.ui.postMessage({
  type: 'page-frames-updated',
  pageFrameCount: currentPageFrames.length,
  pageName: figma.currentPage.name
});
```

## 11. Plugin Auto-Close ✅

### Optional Auto-Close
```typescript
// Auto-close plugin after successful submission (optional)
setTimeout(() => {
  // figma.closePlugin(); // Uncomment to enable
}, 2000);
```

**Note:** Currently commented out. Uncomment to enable auto-close.

## 12. Webhook URLs ✅

### Configurable Endpoints
```typescript
const N8N_WEBHOOK_URL = 'https://your-n8n-webhook-url.com'; 
const DEFAULT_WORKER_URL = 'https://figma-ux-analyzer.your-account.workers.dev';

// Used in analysis
const webhookUrl = config.workerUrl || DEFAULT_WORKER_URL;
```

**Update these constants:**
- `N8N_WEBHOOK_URL` - For N8N integration
- `DEFAULT_WORKER_URL` - For Cloudflare Worker

## Additional Features

### User Metadata Collection
```typescript
function getUserMetadata(): UserMetadata {
  return {
    name: figma.currentUser?.name || 'Unknown User',
    email: figma.currentUser?.email || '',
    id: figma.currentUser?.id || 'anonymous',
    timestamp: new Date().toISOString()
  };
}
```

### File Metadata Collection
```typescript
function getFileMetadata(): FileMetadata {
  return {
    fileKey: figma.fileKey || '',
    fileName: figma.root.name,
    fileUrl: `https://figma.com/file/${figma.fileKey}`,
    pageName: figma.currentPage.name,
    pageId: figma.currentPage.id
  };
}
```

### Initial Data Request
```typescript
case 'get-initial-data':
  handleGetInitialData();  // Sends user, file, selection data
```

## TypeScript Types ✅

### Complete Type Definitions

```typescript
interface AnalysisConfig {
  workerUrl: string;
  designType: string;
  platform: string;
  frameworks: {
    accessibility: boolean;
    heuristics: boolean;
    gestalt: boolean;
    platformGuidelines: boolean;
    uxLaws: boolean;
  };
}

interface FrameData {
  id: string;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
}

interface UserMetadata {
  name: string;
  email: string;
  id: string;
  timestamp: string;
}

interface FileMetadata {
  fileKey: string;
  fileName: string;
  fileUrl: string;
  pageName: string;
  pageId: string;
}

interface AnalysisPayload {
  fileKey: string;
  fileName: string;
  fileUrl: string;
  pageName: string;
  pageId: string;
  frameCount: number;
  analysisType: 'selected' | 'page';
  frames: FrameData[];
  config: { ... };
  user: { ... };
}
```

## Message Types

### Plugin → UI Messages
```typescript
// Selection updates
{ type: 'selection-updated', frames: [], count: number }

// Page frames updates
{ type: 'page-frames-updated', pageFrameCount: number, pageName: string }

// Initial data
{ type: 'initial-data', user: UserMetadata, file: FileMetadata }

// Test connection results
{ type: 'test-started' }
{ type: 'test-success', data: any }
{ type: 'test-failed', message: string }

// Analysis status
{ type: 'analysis-started' }
{ type: 'analysis-complete', result: any }
{ type: 'analysis-error', message: string }

// Errors
{ type: 'error', message: string }
```

### UI → Plugin Messages
```typescript
// Analysis triggers
{ type: 'analyze-selected', config: AnalysisConfig, userInfo: any }
{ type: 'analyze-page', config: AnalysisConfig, userInfo: any }

// Test connection
{ type: 'test-connection', workerUrl: string }

// Get initial data
{ type: 'get-initial-data' }

// Close plugin
{ type: 'cancel' }
```

## Usage Example

### Analyze Selected Frames
```typescript
// UI sends:
parent.postMessage({
  pluginMessage: {
    type: 'analyze-selected',
    config: {
      workerUrl: 'https://worker.dev',
      designType: 'mobile',
      platform: 'ios',
      frameworks: { accessibility: true, ... }
    },
    userInfo: {
      name: 'John Doe',
      email: 'john@example.com'
    }
  }
}, '*');

// Plugin sends payload to worker:
{
  fileKey: 'abc123',
  fileName: 'My Design',
  fileUrl: 'https://figma.com/file/abc123',
  frames: [{ id: '1:2', name: 'Login', ... }],
  user: { name: 'John Doe', ... },
  config: { ... }
}
```

## Console Logging

### Detailed Logs
```typescript
// Analysis start
console.log('📤 Sending analysis request:', {
  frames: payload.frameCount,
  type: analysisType,
  file: payload.fileName
});

// Errors
console.error('❌ Analysis error:', error);

// Unknown messages
console.warn('Unknown message type:', msg.type);
```

## Figma Notifications

### In-App Notifications
```typescript
// Info
figma.notify('🔄 Starting analysis...', { timeout: 2000 });

// Success
figma.notify('✅ Analysis complete!', { timeout: 5000 });

// Error
figma.notify('❌ Analysis failed', { error: true, timeout: 5000 });

// Warning
figma.notify('⚠️ No frames selected', { error: true });
```

## Configuration Constants

### Update These
```typescript
// Line 7-8
const N8N_WEBHOOK_URL = 'https://your-n8n-webhook-url.com';
const DEFAULT_WORKER_URL = 'https://figma-ux-analyzer.your-account.workers.dev';
```

**After deployment:**
1. Update `DEFAULT_WORKER_URL` with your deployed Worker URL
2. Or configure via UI (saved in localStorage)

## Build & Test

### Build Plugin
```bash
cd figma-plugin
npm run build
```

### Install in Figma
1. Open Figma Desktop App
2. **Plugins** → **Development** → **Import plugin from manifest**
3. Select `figma-plugin/manifest.json`

### Test Features
- ✅ Select frames → Count updates
- ✅ Click "Analyze Selected" → Sends request
- ✅ Click "Analyze Page" → Sends all frames
- ✅ Test connection → Validates endpoint
- ✅ Change config → Updates payload
- ✅ View notifications → Success/error messages

---

**All requested features implemented! ✅**

