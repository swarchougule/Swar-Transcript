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
}

export async function processAiAction(
  action: AiAction,
  transcript: string,
  videoTitle?: string,
  question?: string,
  targetLanguage?: string
): Promise<AiActionResult> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      return {
        success: false,
        error: 'Please sign in to your account to use the AI Toolkit.',
      };
    }

    if (!transcript || transcript.trim().length === 0) {
      return {
        success: false,
        error: 'No transcript content available for AI processing.',
      };
    }

    if (action === 'ask' && (!question || question.trim().length === 0)) {
      return {
        success: false,
        error: 'Please enter a question to ask the AI.',
      };
    }

    const { data, error } = await supabase.functions.invoke('ai-toolkit', {
      body: {
        action,
        transcript,
        videoTitle,
        question,
        targetLanguage,
      },
    });

    if (error) {
      let errorMsg = error.message;
      if (data && data.error) {
        errorMsg = data.error;
      } else if ('context' in error && error.context) {
        try {
          const errBody = await (error as any).context.json();
          if (errBody && errBody.error) {
            errorMsg = errBody.error;
          }
        } catch {
          // ignore parsing error
        }
      }
      return {
        success: false,
        error: errorMsg || 'AI processing service error.',
      };
    }

    if (!data || !data.success) {
      return {
        success: false,
        error: data?.error || 'Failed to process AI request.',
      };
    }

    return {
      success: true,
      action: data.action,
      result: data.result,
    };
  } catch (err: any) {
    console.error('processAiAction error:', err);
    return {
      success: false,
      error: err?.message || 'A network error occurred while connecting to the AI service.',
    };
  }
}
