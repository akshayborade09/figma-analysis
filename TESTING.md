# Testing Guide

Complete testing guide for the Figma UX Analysis tool.

## 🧪 Testing Strategy

### Test Levels
1. **Unit Tests**: Individual functions
2. **Integration Tests**: Component interactions
3. **End-to-End Tests**: Full workflow
4. **Manual Tests**: User scenarios

## 🔧 Testing the Cloudflare Worker

### Local Testing

#### 1. Start Local Server
```bash
cd cloudflare-worker
npm run dev
```

Server runs at `http://localhost:8787`

#### 2. Test Connection Endpoint
```bash
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Connection successful!",
  "timestamp": "2025-10-30T12:00:00.000Z"
}
```

#### 3. Test with Mock Data

**Using test.http file** (VS Code REST Client):
1. Open `cloudflare-worker/test.http`
2. Update `@baseUrl` to `http://localhost:8787`
3. Click "Send Request" on any test

**Using curl:**
```bash
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{
    "fileKey": "test123",
    "fileName": "Test File",
    "fileUrl": "https://figma.com/file/test123",
    "pageName": "Test Page",
    "pageId": "0:1",
    "frameCount": 1,
    "analysisType": "selected",
    "frames": [{
      "id": "1:1",
      "name": "Test Frame",
      "width": 375,
      "height": 812,
      "x": 0,
      "y": 0
    }],
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
      "name": "Test User",
      "email": "test@example.com",
      "id": "test-123",
      "timestamp": "2025-10-30T12:00:00.000Z"
    }
  }'
```

### Production Testing

#### 1. Test Deployed Worker
```bash
curl -X POST https://your-worker.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

#### 2. Monitor Logs
```bash
cd cloudflare-worker
npm run tail
```

Keep this running during tests to see real-time logs.

### Unit Testing Functions

#### Test buildAnalysisPrompt
```javascript
// In browser console or Node:
const frame = { name: "Login", width: 375, height: 812 };
const config = {
  designType: "mobile",
  platform: "ios",
  frameworks: { accessibility: true }
};

const prompt = buildAnalysisPrompt(frame, config);
console.log(prompt);
// Should include WCAG guidelines
```

#### Test Comment Formatting
```javascript
const item = {
  location: "Primary button",
  category: "WCAG Accessibility",
  severity: "high",
  finding: "Low contrast",
  recommendation: "Use darker color",
  principle: "WCAG 1.4.3"
};

const comment = formatComment(item);
console.log(comment);
// Should include emoji and markdown
```

## 🎨 Testing the Figma Plugin

### Build for Testing
```bash
cd figma-plugin
npm run build
```

### Import to Figma
1. Open Figma Desktop
2. Plugins → Development → Import plugin
3. Select `manifest.json`

### Manual Test Scenarios

#### Scenario 1: Single Frame Analysis
1. Create new Figma file
2. Add frame (F key)
3. Choose "iPhone 14 Pro"
4. Add button, text, input
5. Select frame
6. Run plugin
7. Click "Analyze Selected Frames"
8. Wait 15-30 seconds
9. Check comments

**Expected Results:**
- ✅ Success message appears
- ✅ Summary comment posted
- ✅ 10-15 individual comments
- ✅ Comments have emojis and formatting
- ✅ At least 2 positive findings

#### Scenario 2: Multiple Frames
1. Create 3 frames
2. Add different UI to each
3. Select all 3 frames
4. Run plugin
5. Click "Analyze Selected Frames"
6. Wait 45-90 seconds
7. Check all frames have comments

**Expected Results:**
- ✅ All frames analyzed
- ✅ Each frame has comments
- ✅ Success count matches

#### Scenario 3: Page Analysis
1. Create 5+ frames
2. Don't select any
3. Run plugin
4. Click "Analyze Current Page"
5. Wait 2-5 minutes

**Expected Results:**
- ✅ All page frames analyzed
- ✅ Comments on each frame
- ✅ No errors in plugin

#### Scenario 4: No Selection
1. Deselect all
2. Run plugin
3. Try to click "Analyze Selected"

**Expected Results:**
- ✅ Button is disabled
- ✅ Tip shown
- ✅ Badge shows "0"

#### Scenario 5: Test Connection
1. Run plugin
2. Click "Test Connection"

**Expected Results:**
- ✅ Green success message
- ✅ Connection confirmed
- ✅ Button re-enables

#### Scenario 6: Error Handling
1. Enter invalid Worker URL
2. Click "Test Connection"

**Expected Results:**
- ✅ Red error message
- ✅ Helpful error text
- ✅ Button re-enables

### Plugin UI Testing

#### Visual Tests
- [ ] Badge colors correct (blue/green)
- [ ] Button hover effects work
- [ ] Dropdowns open properly
- [ ] Checkboxes toggle
- [ ] Status messages animate
- [ ] Spinner shows during loading
- [ ] Text updates dynamically

#### Interaction Tests
- [ ] Selection updates in real-time
- [ ] Count badge updates
- [ ] Buttons enable/disable correctly
- [ ] Form inputs save values
- [ ] Messages auto-hide after 5s

## 🔄 Integration Testing

### End-to-End Workflow
```
1. Select frames in Figma
   ↓ Plugin detects
2. Configure analysis
   ↓ User sets options
3. Click analyze
   ↓ Sends to Worker
4. Worker exports images
   ↓ Calls Figma API
5. Worker analyzes with Claude
   ↓ Sends to Claude API
6. Worker posts comments
   ↓ Calls Figma API
7. Plugin shows success
   ↓ User sees result
8. Comments appear in Figma
   ✅ Complete
```

### Test Each Integration Point

#### Plugin ↔ Worker
```bash
# Monitor Worker logs while using plugin
npm run tail
```

Check logs show:
- ✅ Request received
- ✅ Payload parsed
- ✅ Frames being processed

#### Worker ↔ Figma API
```bash
# Check Figma API responses in logs
```

Should see:
- ✅ Image export successful
- ✅ Image URL received
- ✅ Comments posted

#### Worker ↔ Claude API
```bash
# Check Claude responses in logs
```

Should see:
- ✅ Image sent
- ✅ Analysis received
- ✅ JSON parsed

## 🐛 Error Testing

### Test Error Scenarios

#### 1. Missing API Keys
```bash
# Remove secrets temporarily
wrangler secret delete ANTHROPIC_API_KEY

# Test - should fail gracefully
curl -X POST http://localhost:8787 -d '{"test":true}'
```

Expected: Error message about missing keys

#### 2. Invalid Figma Token
- Use expired/invalid token
- Try to analyze
- Should show clear error

#### 3. Network Failures
- Disconnect internet during analysis
- Should handle timeout gracefully

#### 4. Invalid Frame IDs
- Use non-existent frame ID
- Should skip and continue with others

#### 5. Rate Limiting
- Analyze 20+ frames quickly
- Should handle with delays

## 📊 Performance Testing

### Measure Response Times

#### Single Frame
```bash
time curl -X POST https://your-worker.workers.dev -d '...'
```

**Target:** < 20 seconds

#### Multiple Frames
- 3 frames: ~45-60 seconds
- 5 frames: ~90-120 seconds
- 10 frames: ~3-5 minutes

### Monitor Metrics
1. Go to Cloudflare Dashboard
2. View Worker metrics
3. Check:
   - Average response time
   - Success rate
   - Error rate

## 🔍 Debugging Tools

### Logging
```javascript
// In Worker code
console.log('📊 Processing frame:', frame.name);
console.log('✅ Success:', result);
console.error('❌ Error:', error);
```

View in:
```bash
npm run tail
```

### Browser DevTools
1. Open plugin
2. Plugins → Development → Open Console
3. View plugin logs

### Network Inspection
1. Open DevTools → Network tab
2. Use plugin
3. Check POST requests
4. View payloads and responses

## ✅ Test Checklist

### Before Release
- [ ] All unit tests pass
- [ ] Integration tests complete
- [ ] End-to-end workflow works
- [ ] Error handling verified
- [ ] Performance acceptable
- [ ] UI responsive
- [ ] All platforms tested (iOS, Android, Web)
- [ ] All design types tested
- [ ] Multiple frames work
- [ ] Comments format correctly
- [ ] Logs clean (no errors)
- [ ] Cost estimates accurate

### Regression Tests
Run before each deployment:
- [ ] Test connection works
- [ ] Single frame analysis
- [ ] Multiple frame analysis
- [ ] Page analysis
- [ ] All platforms
- [ ] Error cases

## 📝 Test Documentation

### Log Test Results
```markdown
## Test Run: 2025-10-30

### Environment
- Worker: https://figma-ux-analyzer.workers.dev
- Figma: Desktop App v116.10.5
- OS: macOS 14.6

### Results
✅ Connection test: PASS
✅ Single frame: PASS (18s)
✅ Multiple frames: PASS (52s)
✅ Page analysis: PASS (2m 15s)
✅ Error handling: PASS
❌ Rate limiting: FAIL (needs investigation)

### Issues Found
1. Rate limit hit at 15 frames
2. Comment positioning overlaps
3. Spinner doesn't show immediately

### Next Steps
- Fix rate limit handling
- Adjust comment positions
- Add immediate spinner feedback
```

## 🎯 Success Criteria

Tests pass when:
- ✅ Connection test succeeds
- ✅ Analysis completes without errors
- ✅ Comments appear correctly formatted
- ✅ All severity levels present
- ✅ Positive findings included
- ✅ Response times acceptable
- ✅ Error messages helpful
- ✅ No console errors
- ✅ Logs show expected flow
- ✅ Costs within estimates

---

**Happy testing! 🧪**

