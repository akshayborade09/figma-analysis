/**
 * Shared TypeScript types
 */

export interface FrameInfo {
  id: string;
  name: string;
  width: number;
  height: number;
}

export interface AnalysisConfig {
  designType: 'mobile' | 'web' | 'desktop' | 'landing';
  platform: 'ios' | 'android' | 'web';
  frameworks: {
    accessibility: boolean;
    heuristics: boolean;
    gestalt: boolean;
    platformGuidelines: boolean;
    uxLaws: boolean;
  };
}

export interface AnalysisPayload {
  fileKey: string;
  fileName: string;
  frameCount: number;
  frames: FrameInfo[];
  config: AnalysisConfig;
}

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'positive';

export interface FeedbackItem {
  location: string;
  category: string;
  severity: SeverityLevel;
  finding: string;
  recommendation: string;
  principle: string;
}

export interface AnalysisResult {
  frameId: string;
  frameName: string;
  success: boolean;
  commentsPosted?: number;
  error?: string;
}

export interface WorkerResponse {
  success: boolean;
  analyzed: number;
  failed: number;
  results: AnalysisResult[];
  message: string;
}

export interface FigmaImageExportResponse {
  err?: string;
  images: Record<string, string>;
}

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: Array<{
    type: 'text' | 'image';
    text?: string;
    source?: {
      type: 'base64';
      media_type: string;
      data: string;
    };
  }>;
}

export interface ClaudeResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface CommentPosition {
  x: number;
  y: number;
}

export interface FigmaCommentPayload {
  message: string;
  client_meta: {
    node_id: string;
    node_offset: CommentPosition;
  };
}

