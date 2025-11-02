/**
 * Shared utility functions
 */

import { SEVERITY_LEVELS, SEVERITY_ICONS } from './constants.js';

/**
 * Validate analysis payload
 */
export function validatePayload(payload) {
  const errors = [];

  if (!payload.fileKey) errors.push('Missing fileKey');
  if (!payload.fileName) errors.push('Missing fileName');
  if (!payload.frames || !Array.isArray(payload.frames)) errors.push('Missing or invalid frames array');
  if (!payload.config) errors.push('Missing config');
  
  if (payload.frames && payload.frames.length === 0) {
    errors.push('No frames provided');
  }

  if (payload.config) {
    if (!payload.config.designType) errors.push('Missing designType');
    if (!payload.config.platform) errors.push('Missing platform');
    if (!payload.config.frameworks) errors.push('Missing frameworks');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize frame name for display
 */
export function sanitizeFrameName(name) {
  return name.replace(/[<>]/g, '').trim();
}

/**
 * Format bytes to human readable
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Calculate color contrast ratio
 */
export function getContrastRatio(color1, color2) {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Get relative luminance
 */
function getLuminance(rgb) {
  const [r, g, b] = rgb.map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Group feedback items by severity
 */
export function groupBySeverity(feedbackItems) {
  return {
    critical: feedbackItems.filter(f => f.severity === SEVERITY_LEVELS.CRITICAL),
    high: feedbackItems.filter(f => f.severity === SEVERITY_LEVELS.HIGH),
    medium: feedbackItems.filter(f => f.severity === SEVERITY_LEVELS.MEDIUM),
    low: feedbackItems.filter(f => f.severity === SEVERITY_LEVELS.LOW),
    positive: feedbackItems.filter(f => f.severity === SEVERITY_LEVELS.POSITIVE)
  };
}

/**
 * Get emoji for severity
 */
export function getSeverityIcon(severity) {
  return SEVERITY_ICONS[severity] || '⚪';
}

/**
 * Delay execution
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry async function
 */
export async function retryAsync(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(delay * (i + 1));
    }
  }
}

/**
 * Truncate text
 */
export function truncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Parse JSON safely
 */
export function safeJSONParse(text, fallback = null) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

/**
 * Validate URL
 */
export function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate timestamp
 */
export function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) + ' UTC';
}

