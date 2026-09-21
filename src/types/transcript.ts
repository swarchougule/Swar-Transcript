export interface TranscriptSegment {
  id: string;
  timestamp: string; // e.g., "00:15"
  seconds: number;
  speaker?: string;
  text: string;
}

export interface VideoMetadata {
  id: string;
  url: string;
  title: string;
  channel: string;
  duration: string;
  wordCount: number;
  characterCount: number;
  thumbnailUrl?: string;
  publishedDate?: string;
}

export interface TranscriptData {
  video: VideoMetadata;
  segments: TranscriptSegment[];
  fullText: string;
}

export type AuthMode = 'signin' | 'signup';
