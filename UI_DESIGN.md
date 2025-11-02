# Figma Plugin UI Design Documentation

Complete design system and feature breakdown for the UX Analysis Bot UI.

## 🎨 Design System

### Colors
- **Primary Blue**: `#0066cc` - Main actions, headers
- **Success Green**: `#28a745` - Success states, active badges
- **Error Red**: `#dc3545` - Error states
- **Info Blue**: `#17a2b8` - Information messages
- **Warning Yellow**: `#ffd966` - Tips and warnings
- **Neutral Gray**: `#f5f5f5` - Secondary buttons, backgrounds
- **Text Dark**: `#1a1a1a` - Primary text
- **Text Medium**: `#666` - Secondary text
- **Border**: `#e0e0e0` - Borders and dividers

### Typography
- **Font Family**: Inter, system fonts fallback
- **H1**: 18px, 700 weight (Header title)
- **H2**: 12px, 600 weight, uppercase (Section titles)
- **Body**: 13px, 400 weight (General text)
- **Small**: 11px, 500 weight (Labels, tips)
- **Tiny**: 10px, 400 weight (Footer)

### Spacing
- **Base**: 16px (Main padding)
- **Section Gap**: 20px
- **Element Gap**: 8-12px
- **Micro Gap**: 4-6px

### Border Radius
- **Cards**: 8px
- **Buttons**: 8px
- **Inputs**: 8px
- **Badges**: 20px (pill shape)
- **Small Elements**: 6px

### Shadows
- **Buttons**: `0 2px 8px rgba(0, 102, 204, 0.3)`
- **Button Hover**: `0 4px 12px rgba(0, 102, 204, 0.4)`
- **Status Messages**: `0 2px 8px rgba(0, 0, 0, 0.1)`

## 📐 Layout Structure

### Overall Dimensions
- **Width**: 420px (fixed)
- **Height**: 600px (scrollable)
- **Padding**: 16px all sides

### Sections (Top to Bottom)

1. **Header** (60px)
   - Title with emoji
   - Subtitle
   - Bottom border

2. **Frame Selection** (~180px)
   - Selection badge
   - Page badge
   - Two action buttons
   - Tip box

3. **Configuration** (~150px)
   - Design type dropdown
   - Platform dropdown
   - Contained in card

4. **Analysis Frameworks** (~180px)
   - 5 checkboxes with labels
   - Contained in group

5. **Advanced Settings** (~60px)
   - Worker URL input

6. **Status Area** (Variable, hidden by default)
   - Animated messages

7. **Test Connection** (~40px)
   - Small button

8. **Footer** (~30px)
   - Small text

**Total**: ~700px (scrollable)

## 🎯 Component Breakdown

### 1. Header
```html
<div class="header">
  <h1>🤖 UX Analysis Bot</h1>
  <p class="subtitle">AI-powered design feedback</p>
</div>
```

**Features**:
- Centered alignment
- Gradient blue title
- Subtle subtitle
- Bottom border separator

### 2. Selection Badge

**States**:
- **No Selection**: Blue gradient, "No frames selected"
- **Has Selection**: Green gradient, "X frames selected"

**Features**:
- Pill-shaped badge
- Count indicator in circle
- Smooth color transitions
- Slide-in animation

```css
.selection-badge.has-selection {
  background: linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%);
  border-color: #2e7d32;
  color: #2e7d32;
}
```

### 3. Action Buttons

#### Primary Button (Analyze Selected)
- **Color**: Blue gradient
- **Shadow**: Elevated
- **States**:
  - Disabled: Opacity 0.5
  - Enabled: Full opacity
  - Hover: Darker gradient, moves up 1px
  - Active: Scales to 0.98
  - Loading: Shows spinner

**Dynamic Text**:
- "Analyze Selected" (no selection)
- "Analyze 3 Frames" (with count)
- "Analyzing..." (loading)

#### Secondary Button (Analyze Page)
- **Color**: Light gray
- **Border**: Subtle
- **States**: Same as primary

**Dynamic Text**:
- "Analyze Current Page" (default)
- "Analyze Page (5 frames)" (with count)
- "Analyzing..." (loading)

### 4. Configuration Card

**Design**:
- Light gray background
- Border and border radius
- Internal padding
- Two dropdowns

**Options**:
- **Design Type**: Mobile App, Web App, Dashboard, Landing Page, E-commerce, SaaS
- **Platform**: iOS, Android, Web, Responsive, Desktop

### 5. Checkbox Group

**Features**:
- All checked by default
- Grouped in container
- Hover effect: Slides right 2px
- Custom accent color (blue)
- Clear labels

**Frameworks**:
1. ✓ WCAG Accessibility
2. ✓ Nielsen's 10 Heuristics
3. ✓ Gestalt Principles
4. ✓ Platform Guidelines
5. ✓ UX Laws

### 6. Status Messages

**Types**:
- **Success**: Green gradient, ✅ icon
- **Error**: Red gradient, ❌ icon
- **Info**: Blue gradient, ⏳/🔄 icon

**Animation**:
- Slide down from top
- Fade in
- Auto-hide after 5 seconds (success/error)

```css
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 7. Tip Box

**Design**:
- Light yellow background
- Yellow border
- 💡 icon
- Small font

**Purpose**: Guide users to select frames

### 8. Test Connection Button

**Features**:
- Small size
- Secondary style
- Bottom of page
- Shows loading state

## 🎭 Interactions & Animations

### Button States
1. **Default**: Normal appearance
2. **Hover**: Darker color, lift up, larger shadow
3. **Active**: Scale down to 0.98
4. **Disabled**: 50% opacity, no interaction
5. **Loading**: Shows spinner, disabled

### Selection Updates
- Badge color changes instantly
- Count updates with animation
- Button text updates dynamically
- Button enabled/disabled state toggles

### Status Messages
- Slide down animation (0.3s)
- Fade in
- Auto-hide timer for success/error
- Remain visible for info

### Form Interactions
- Focus: Blue border, shadow glow
- Hover: Darker border
- Dropdown: Native behavior
- Checkbox: Custom accent color

## 📱 Responsive Behavior

### At 420px Width
- All elements fit comfortably
- No horizontal scroll
- Vertical scroll enabled
- Touch-friendly sizes (44px minimum)

### Overflow Handling
- Body scrolls vertically
- Custom scrollbar styling
- Smooth scrolling
- No horizontal overflow

## 🎨 Visual Hierarchy

### Priority Levels
1. **Primary Action**: "Analyze Selected" (blue, prominent)
2. **Secondary Action**: "Analyze Page" (gray)
3. **Configuration**: Form elements (nested in card)
4. **Status**: Messages (animated when shown)
5. **Tertiary**: Test connection (small, bottom)

### Visual Weight
- **Heaviest**: Primary button
- **Heavy**: Section headers
- **Medium**: Form labels, text
- **Light**: Tips, footer

## 🔄 State Management

### JavaScript State Variables
```javascript
let selectedFrames = [];      // Current selection
let pageFrameCount = 0;        // Total page frames
let pageName = '';             // Page name
let isAnalyzing = false;       // Analysis in progress
```

### Persisted State
```javascript
localStorage.setItem('workerUrl', url);  // Saved across sessions
```

### Message Handling
```javascript
window.onmessage = (event) => {
  const msg = event.data.pluginMessage;
  // Handle: selection-updated, analysis-started, etc.
};
```

## 🎪 Animation Catalog

### Entrance Animations
- **Badge**: Slide in from top (0.3s)
- **Status**: Slide down (0.3s)
- **Buttons**: Instant

### Interaction Animations
- **Button Hover**: Transform translateY(-1px), shadow increase
- **Button Active**: Transform scale(0.98)
- **Checkbox Hover**: Transform translateX(2px)
- **Spinner**: Rotate 360° (0.8s infinite)

### Exit Animations
- **Status**: Fade out (auto after 5s)

## 🌟 Polish & Details

### Micro-Interactions
- Smooth transitions (0.2s ease)
- Hover lift on buttons
- Active press effect
- Focus glow on inputs

### Typography Details
- Uppercase section headers with letter-spacing
- Antialiased rendering
- Proper line-height (1.5)
- Color contrast for readability

### Spacing Consistency
- 16px base padding
- 20px between sections
- 8px between related elements
- 12px for form groups

### Accessibility
- High contrast colors
- Focus indicators
- Keyboard navigation support
- Screen reader friendly labels

## 📊 Component States Matrix

| Component | Default | Hover | Active | Disabled | Loading |
|-----------|---------|-------|--------|----------|---------|
| Primary Button | Blue | Darker | Scale | Fade | Spinner |
| Secondary Button | Gray | Darker | Scale | Fade | Spinner |
| Selection Badge | Blue | - | - | - | - |
| Badge (Active) | Green | - | - | - | - |
| Checkbox | Default | - | Checked | - | - |
| Input | Gray bg | Border | Focus | - | - |
| Status | Hidden | - | - | - | - |

## 🎨 Gradient Formulas

### Primary Button
```css
background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%);
/* Hover */
background: linear-gradient(135deg, #0052a3 0%, #003d7a 100%);
```

### Selection Badge (No Selection)
```css
background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
```

### Selection Badge (Has Selection)
```css
background: linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%);
```

### Status Messages
```css
/* Success */
background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);

/* Error */
background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);

/* Info */
background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
```

## 🔧 Customization Guide

### Changing Primary Color
Replace `#0066cc` throughout:
```css
/* In buttons, badges, borders, focus states */
```

### Adjusting Spacing
Modify base padding:
```css
body { padding: 16px; }  /* Change to 20px for more space */
```

### Font Size Scaling
Multiply all font sizes by factor:
```css
font-size: 13px;  /* Base */
/* Scale to 14px for larger text */
```

## 📸 Visual Examples

### States
```
No Selection:
[Blue Badge: "No frames selected" | 0]

With Selection:
[Green Badge: "3 frames selected" | 3]
[Blue Button: "🚀 Analyze 3 Frames"]

Loading:
[Gray Button: "⏳ Analyzing..."]

Success:
[Green Message: "✅ Analysis complete! 3 frames analyzed"]
```

## 🎯 Best Practices Applied

1. **Visual Hierarchy**: Clear primary/secondary actions
2. **Feedback**: Immediate visual response to actions
3. **Consistency**: Uniform spacing, colors, shapes
4. **Accessibility**: High contrast, keyboard support
5. **Performance**: CSS animations (GPU accelerated)
6. **Responsive**: Scrollable, flexible content
7. **Polish**: Smooth transitions, hover effects
8. **User Guidance**: Tips, clear labels, status messages

---

**Result**: A modern, professional, user-friendly interface! ✨

