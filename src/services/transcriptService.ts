import { supabase } from '../lib/supabase';
import type { TranscriptData } from '../types/transcript';

export interface GenerateTranscriptResult {
  success: boolean;
  transcript?: TranscriptData;
  error?: string;
}

export async function generateTranscript(youtubeUrl: string): Promise<GenerateTranscriptResult> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      return {
        success: false,
        error: 'Please sign in or create an account to generate transcripts.',
      };
    }

    const { data, error } = await supabase.functions.invoke('generate-transcript', {
      body: { youtubeUrl },
    });

    if (error) {
      // FunctionsHttpError contains the response message if available
      let errorMsg = error.message;
      if (data && data.error) {
        errorMsg = data.error;
      }
      return {
        success: false,
        error: errorMsg || 'Failed to generate transcript. Please try again.',
      };
    }

    if (!data || !data.success) {
      return {
        success: false,
        error: data?.error || 'Unable to retrieve transcript for this video.',
      };
    }

    return {
      success: true,
      transcript: data.data as TranscriptData,
    };
  } catch (err: any) {
    console.error('generateTranscript client error:', err);
    return {
      success: false,
      error: err?.message || 'A network error occurred while connecting to the transcription service.',
    };
  }
}
