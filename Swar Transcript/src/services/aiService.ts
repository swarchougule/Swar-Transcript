import { supabase } from '../lib/supabase';

export type AiAction =
  | 'summary'
  | 'takeaways'
  | 'action_items'
  | 'chapters'
  | 'rewrite'
  | 'translate'
  | 'notes'
  | 'ask';

export interface AiActionResult {
  success: boolean;
  action?: AiAction;
  result?: string;
  error?: string;
  statusCode?: number;
  stage?: string;
}

export async function processAiAction(
  action: AiAction,
  transcript: string,
  videoTitle?: string,
  question?: string,
  targetLanguage?: string
): Promise<AiActionResult> {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('[aiService] Session retrieval error:', sessionError.message);
    }

    const session = sessionData?.session;
    if (!session || !session.access_token) {
      console.warn('[aiService] No active user session found.');
      return {
        success: false,
        error: 'Please sign in to your account to use the AI Toolkit.',
        statusCode: 401,
        stage: 'authentication',
      };
    }

    if (!transcript || transcript.trim().length === 0) {
      return {
        success: false,
        error: 'No transcript content available for AI processing.',
        stage: 'validation',
      };
    }

    if (action === 'ask' && (!question || question.trim().length === 0)) {
      return {
        success: false,
        error: 'Please enter a question to ask the AI.',
        stage: 'validation',
      };
    }

    console.info(`[aiService] Executing AI action '${action}' via Supabase Edge Function: ai-toolkit`);

    const { data, error } = await supabase.functions.invoke('ai-toolkit', {
      body: {
        action,
        transcript,
        videoTitle,
        question,
        targetLanguage,
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      let statusCode = 500;
      let errorMsg = error.message;

      if ('context' in error && (error as any).context) {
        const response: Response = (error as any).context;
        statusCode = response.status || 500;
        try {
          const cloned = response.clone ? response.clone() : response;
          const errBody = await cloned.json();
          console.info('[aiService] Edge Function HTTP Status:', statusCode);
          console.info('[aiService] Edge Function Response Body:', errBody);
          if (errBody && errBody.error) {
            errorMsg = errBody.error;
          }
        } catch {
          try {
            const textBody = await response.text();
            console.info('[aiService] Edge Function HTTP Status:', statusCode);
            console.info('[aiService] Edge Function Text Body:', textBody);
            if (textBody && textBody.length < 300) {
              errorMsg = textBody;
            }
          } catch {
            // ignore
          }
        }
      }

      if (data && data.error) {
        errorMsg = data.error;
      }

      console.error(`[aiService] AI action '${action}' failed (HTTP ${statusCode}):`, errorMsg);

      return {
        success: false,
        error: errorMsg || 'AI processing service error. Please try again.',
        statusCode,
        stage: 'edge_function',
      };
    }

    if (!data || !data.success) {
      const serverMsg = data?.error || 'Failed to process AI request.';
      console.warn('[aiService] AI response unfulfilled:', serverMsg);
      return {
        success: false,
        error: serverMsg,
        stage: 'response_parsing',
      };
    }

    console.info(`[aiService] Action '${action}' completed successfully!`);

    return {
      success: true,
      action: data.action,
      result: data.result,
      statusCode: 200,
      stage: 'completed',
    };
  } catch (err: any) {
    console.error('[aiService] Unhandled client exception:', err);
    return {
      success: false,
      error: err?.message || 'A network error occurred while connecting to the AI service.',
      stage: 'network_exception',
    };
  }
}
