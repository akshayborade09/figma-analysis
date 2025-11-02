/**
 * Shared constants used across plugin and worker
 */

export const ANALYSIS_FRAMEWORKS = {
  ACCESSIBILITY: 'accessibility',
  HEURISTICS: 'heuristics',
  GESTALT: 'gestalt',
  PLATFORM_GUIDELINES: 'platformGuidelines',
  UX_LAWS: 'uxLaws'
};

export const DESIGN_TYPES = {
  MOBILE: 'mobile',
  WEB: 'web',
  DESKTOP: 'desktop',
  LANDING: 'landing'
};

export const PLATFORMS = {
  IOS: 'ios',
  ANDROID: 'android',
  WEB: 'web'
};

export const SEVERITY_LEVELS = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  POSITIVE: 'positive'
};

export const WCAG_GUIDELINES = {
  CONTRAST_MINIMUM: {
    key: 'WCAG 1.4.3',
    name: 'Contrast (Minimum)',
    ratio: 4.5,
    largeTextRatio: 3.0
  },
  TARGET_SIZE: {
    key: 'WCAG 2.5.5',
    name: 'Target Size',
    minimum: 44 // pixels
  },
  TEXT_SPACING: {
    key: 'WCAG 1.4.12',
    name: 'Text Spacing'
  }
};

export const NIELSENS_HEURISTICS = [
  'Visibility of system status',
  'Match between system and real world',
  'User control and freedom',
  'Consistency and standards',
  'Error prevention',
  'Recognition rather than recall',
  'Flexibility and efficiency of use',
  'Aesthetic and minimalist design',
  'Help users recognize, diagnose, and recover from errors',
  'Help and documentation'
];

export const GESTALT_PRINCIPLES = [
  'Proximity',
  'Similarity',
  'Closure',
  'Continuity',
  'Figure/Ground',
  'Common Region',
  'Focal Point'
];

export const UX_LAWS = {
  FITTS: {
    name: "Fitts's Law",
    description: 'Time to acquire target is function of distance and size'
  },
  HICKS: {
    name: "Hick's Law",
    description: 'Time to make decision increases with number of choices'
  },
  MILLERS: {
    name: "Miller's Law",
    description: 'Average person can hold 7±2 items in working memory'
  },
  JAKOBS: {
    name: "Jakob's Law",
    description: 'Users spend most time on other sites, prefer familiarity'
  }
};

export const API_CONFIG = {
  CLAUDE_VERSION: '2023-06-01',
  CLAUDE_MODEL: 'claude-sonnet-4-20250514',
  MAX_TOKENS: 4096,
  FIGMA_API_BASE: 'https://api.figma.com/v1',
  IMAGE_SCALE: 2,
  IMAGE_FORMAT: 'png'
};

export const COMMENT_POSITIONS = [
  { x: 0.95, y: 0.15 }, // Top right
  { x: 0.95, y: 0.35 }, // Mid right
  { x: 0.95, y: 0.55 }, // Lower right
  { x: 0.95, y: 0.75 }, // Bottom right
  { x: 0.05, y: 0.75 }, // Bottom left
  { x: 0.05, y: 0.55 }, // Lower left
  { x: 0.05, y: 0.35 }, // Mid left
  { x: 0.50, y: 0.95 }  // Bottom center
];

export const SEVERITY_ICONS = {
  [SEVERITY_LEVELS.CRITICAL]: '🔴',
  [SEVERITY_LEVELS.HIGH]: '🟠',
  [SEVERITY_LEVELS.MEDIUM]: '🟡',
  [SEVERITY_LEVELS.LOW]: '🔵',
  [SEVERITY_LEVELS.POSITIVE]: '✅'
};

export const RATE_LIMITS = {
  COMMENT_DELAY_MS: 150,
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000
};

