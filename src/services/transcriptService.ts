import { supabase } from '../lib/supabase';
import type { TranscriptData } from '../types/transcript';

export interface GenerateTranscriptResult {
  success: boolean;
  transcript?: TranscriptData;
  error?: string;
  statusCode?: number;
  stage?: string;
}

export async function generateTranscript(youtubeUrl: string): Promise<GenerateTranscriptResult> {
  try {
    const cleanUrl = (youtubeUrl || '').trim();
    if (!cleanUrl) {
      return {
        success: false,
        error: 'Please enter a YouTube video URL.',
        stage: 'validation',
      };
    }

    // 1. Session verification
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('[transcriptService] Session retrieval error:', sessionError.message);
    }

    const session = sessionData?.session;
    if (!session || !session.access_token) {
      console.warn('[transcriptService] No active user session found.');
      return {
        success: false,
        error: 'Please sign in or create an account to generate transcripts.',
        statusCode: 401,
        stage: 'authentication',
      };
    }

    console.info('[transcriptService] Initiating transcript generation for URL:', cleanUrl);
    console.info('[transcriptService] User authenticated. Invoking Supabase Edge Function: generate-transcript');

    // 2. Invoke Edge Function with explicit Authorization header
    const { data, error } = await supabase.functions.invoke('generate-transcript', {
      body: { youtubeUrl: cleanUrl },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    // 3. Handle Edge Function Error (FunctionsHttpError, etc.)
    if (error) {
      let statusCode = 500;
      let errorMsg = error.message;

      // Extract HTTP status and detailed JSON response body from error.context
      if ('context' in error && (error as any).context) {
        const response: Response = (error as any).context;
        statusCode = response.status || 500;

        try {
          const cloned = response.clone ? response.clone() : response;
          const jsonBody = await cloned.json();
          if (jsonBody) {
            console.info('[transcriptService] Edge Function HTTP Status:', statusCode);
            console.info('[transcriptService] Edge Function Response Body:', jsonBody);
            if (jsonBody.error) {
              errorMsg = jsonBody.error;
            } else if (jsonBody.message) {
              errorMsg = jsonBody.message;
            }
          }
        } catch {
          try {
            const textBody = await response.text();
            console.info('[transcriptService] Edge Function HTTP Status:', statusCode);
            console.info('[transcriptService] Edge Function Text Body:', textBody);
            if (textBody && textBody.length < 300) {
              errorMsg = textBody;
            }
          } catch {
            // Ignore stream reading error
          }
        }
      }

      // If data was returned alongside error
      if (data && data.error) {
        errorMsg = data.error;
      }

      console.error(`[transcriptService] Request failed at stage: edge_function (HTTP ${statusCode}):`, errorMsg);

      return {
        success: false,
        error: errorMsg || 'Failed to generate transcript. Please try again.',
        statusCode,
        stage: 'edge_function',
      };
    }

    // 4. Handle non-success response payloads
    if (!data || !data.success) {
      const serverMsg = data?.error || 'Unable to retrieve transcript for this video.';
      console.warn('[transcriptService] Edge Function returned unfulfilled data:', serverMsg);
      return {
        success: false,
        error: serverMsg,
        stage: 'response_parsing',
      };
    }

    console.info('[transcriptService] Transcript generated successfully! Word count:', data.data?.video?.wordCount);

    return {
      success: true,
      transcript: data.data as TranscriptData,
      statusCode: 200,
      stage: 'completed',
    };
  } catch (err: any) {
    console.error('[transcriptService] Unhandled client exception:', err);
    return {
      success: false,
      error: err?.message || 'A network error occurred while connecting to the transcription service.',
      stage: 'network_exception',
    };
  }
}
