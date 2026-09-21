import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface AiToolkitRequest {
  action: "summary" | "takeaways" | "chapters" | "notes" | "ask";
  transcript: string;
  videoTitle?: string;
  question?: string;
}

/**
 * Server-side sanitizer that purges any residual markdown, HTML, LaTeX,
 * code blocks, or table syntax from model responses, producing pristine plain text.
 */
function cleanPlainText(raw: string): string {
  if (!raw || typeof raw !== "string") return "";

  let text = raw.replace(/\r\n/g, "\n");

  // 1. Remove code fences and inline backticks
  text = text.replace(/```[a-zA-Z]*\n?([\s\S]*?)```/g, "$1");
  text = text.replace(/`([^`]+)`/g, "$1");

  // 2. Remove LaTeX expressions and convert math symbols to standard plain text
  text = text.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1 / $2");
  text = text.replace(/\\times/g, " * ");
  text = text.replace(/\\cdot/g, " * ");
  text = text.replace(/\\pm/g, "+/-");
  text = text.replace(/\\approx/g, "~");
  text = text.replace(/\\text\{([^}]+)\}/g, "$1");
  text = text.replace(/\\textbf\{([^}]+)\}/g, "$1");
  text = text.replace(/\\mathbf\{([^}]+)\}/g, "$1");
  text = text.replace(/\\mathrm\{([^}]+)\}/g, "$1");
  text = text.replace(/\\left|\\right/g, "");
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, "$1");
  text = text.replace(/\$([^\$\n]+)\$/g, "$1");
  text = text.replace(/\\([a-zA-Z]+)/g, "$1");

  // 3. Remove HTML tags, converting <br> to newline
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<\/?[^>]+(>|$)/g, "");

  // 4. Remove Markdown table syntax
  // Remove table separator lines like |---|---| or |:---|---:|
  text = text.replace(/^\s*\|?[\s\-:|]+\|?\s*$/gm, "");
  // Clean pipes from table rows: "| Header 1 | Header 2 |" -> "Header 1 - Header 2"
  text = text.replace(/^\s*\|\s*/gm, "");
  text = text.replace(/\s*\|\s*$/gm, "");
  text = text.replace(/\s*\|\s*/g, " - ");

  // 5. Remove Markdown header hashes (# Header -> Header)
  text = text.replace(/^#{1,6}\s+/gm, "");

  // 6. Remove Markdown bold and italic markers (**bold** -> bold, *italic* -> italic)
  text = text.replace(/\*\*([^*]+)\*\*/g, "$1");
  text = text.replace(/__([^_]+)__/g, "$1");
  text = text.replace(/\*([^*\n]+)\*/g, "$1");
  text = text.replace(/_([^_\n]+)_/g, "$1");

  // 7. Standardize list bullet points (* item or - item -> • item)
  text = text.replace(/^[\*\-\+]\s+/gm, "• ");

  // 8. Clean up extra bullet spaces or double bullets
  text = text.replace(/^[•\s]*•\s*/gm, "• ");

  // 9. Normalize excessive blank lines (more than 2 consecutive newlines -> 2)
  text = text.replace(/\n{3,}/g, "\n\n");

  return text.trim();
}

Deno.serve(async (req: Request) => {
  // 1. Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 2. Validate authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authentication required. Please sign in to use the AI Toolkit." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired session. Please sign in again." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Read GROQ_API_KEY from server-side environment secrets
    const groqApiKey = Deno.env.get("GROQ_API_KEY");
    if (!groqApiKey || groqApiKey.trim() === "") {
      return new Response(
        JSON.stringify({
          error: "GROQ_API_KEY is not configured on the server. Please set the GROQ_API_KEY secret in your Supabase project settings.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Parse request body
    let body: AiToolkitRequest;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid request payload." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, transcript, videoTitle = "YouTube Video", question } = body;

    if (!transcript || typeof transcript !== "string" || transcript.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Transcript content is required for AI processing." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "ask" && (!question || typeof question !== "string" || question.trim().length === 0)) {
      return new Response(
        JSON.stringify({ error: "A question is required for Ask AI." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Intelligent transcript trimming for Groq TPM limits (~8,000 tokens ceiling)
    let processedTranscript = transcript.trim();
    const MAX_TRANSCRIPT_CHARS = 16000; // ~3,800 - 4,000 tokens
    if (processedTranscript.length > MAX_TRANSCRIPT_CHARS) {
      const head = processedTranscript.slice(0, 9500);
      const tail = processedTranscript.slice(-6000);
      processedTranscript = `${head}\n\n[...transcript excerpted for context limits...]\n\n${tail}`;
    }

    const STRICT_PLAIN_TEXT_RULES = `
CRITICAL FORMATTING INSTRUCTIONS:
- Return 100% CLEAN PLAIN TEXT ONLY.
- DO NOT return Markdown tables.
- DO NOT return HTML tags such as <br> or <b>.
- DO NOT return LaTeX expressions (do NOT use $, $$, \\frac, \\times). Write math and formulas normally in standard keyboard text (e.g. E = m * c^2 or Total = A + B).
- DO NOT return code blocks (\`\`\`) or backticks.
- DO NOT return raw JSON.
- DO NOT return markdown syntax such as **bold**, *italic*, # headings, or table separators (|---|).
- Instead use clear section titles, bullet points ('• '), numbered lists ('1. ', '2. '), proper spacing, and short readable paragraphs.`;

    let systemInstruction = "";
    let prompt = "";

    switch (action) {
      case "summary":
        systemInstruction =
          `You are an executive summarizer. Provide a clean, readable plain text summary of the video transcript arranged into 2-3 short, clear paragraphs with a blank line between each paragraph. ${STRICT_PLAIN_TEXT_RULES}`;
        prompt = `Video Title: "${videoTitle}"\n\nTranscript Content:\n${processedTranscript}\n\nTask: Write a concise plain-text summary in short readable paragraphs without asterisks or markdown syntax.`;
        break;

      case "takeaways":
        systemInstruction =
          `You are an expert analyst. Extract the 5 most important takeaways from this video transcript. Format the response strictly as 5 bullet points starting with the bullet symbol '• ' (one takeaway per bullet). Each point should be a clear, informative sentence. ${STRICT_PLAIN_TEXT_RULES}`;
        prompt = `Video Title: "${videoTitle}"\n\nTranscript Content:\n${processedTranscript}\n\nTask: Extract 5 key takeaways using the bullet symbol '• ' for each point. Example format:
• Point 1
• Point 2
• Point 3
• Point 4
• Point 5

Remember: DO NOT use asterisks (**) or bold markdown syntax.`;
        break;

      case "chapters":
        systemInstruction =
          `You are a video chapter creator. Review the transcript and generate logical, chronological chapters with timestamps. Format each chapter as a numbered list item: "Number. Title (Timestamp) - Description". ${STRICT_PLAIN_TEXT_RULES}`;
        prompt = `Video Title: "${videoTitle}"\n\nTranscript Content:\n${processedTranscript}\n\nTask: Generate logical chapters in this exact format:
1. Introduction (00:00) - Description
2. Main Concepts (03:15) - Description
3. Key Applications (08:20) - Description

Remember: DO NOT use asterisks, bold tags, or markdown tables.`;
        break;

      case "notes":
        systemInstruction =
          `You are an executive academic note-taker. Produce clean, structured study notes with clear section titles and bullet points ('• '). Write formulas normally in plain text (for example: E = m * c^2 or Accuracy = Correct / Total), NEVER in LaTeX. ${STRICT_PLAIN_TEXT_RULES}`;
        prompt = `Video Title: "${videoTitle}"\n\nTranscript Content:\n${processedTranscript}\n\nTask: Generate structured notes using clear section titles (in plain text uppercase, e.g. OVERVIEW, CORE CONCEPTS, KEY FORMULAS & INSIGHTS, ACTIONABLE SUMMARY) and bullet points ('• '). Example format:

OVERVIEW
• Important concept
• Definition

CORE CONCEPTS
• Explanation of key principle
• Practical application

FORMULAS & RULES
• Formula written normally without LaTeX (e.g. Rate = Distance / Time)

Remember: Absolutely NO asterisks (**), NO markdown headings (#), NO LaTeX ($), and NO HTML (<br>).`;
        break;

      case "ask":
        systemInstruction =
          `You are a helpful and accurate AI assistant. Answer the user's question directly and concisely based ONLY on the video transcript. If the transcript does not contain the answer, politely state that the video does not cover this topic. ${STRICT_PLAIN_TEXT_RULES}`;
        prompt = `Video Title: "${videoTitle}"\n\nTranscript Content:\n${processedTranscript}\n\nUser Question: ${question}\n\nTask: Answer the user question in clean plain text. Use short paragraphs or clean bullet points ('• ') if listing points. Remember: NO asterisks (**), NO markdown headers, NO HTML.`;
        break;

      default:
        return new Response(
          JSON.stringify({ error: `Unsupported AI action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    console.log(`Executing Groq AI Toolkit action: ${action} for user: ${user.id}`);

    // 6. Discover available models from Groq for this API key
    let candidateModels: string[] = [];

    try {
      const modelsResp = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { "Authorization": `Bearer ${groqApiKey.trim()}` },
      });

      if (modelsResp.ok) {
        const modelsData = await modelsResp.json();
        const available: string[] = (modelsData.data || []).map((m: any) => m.id);
        console.log("Dynamically discovered Groq models:", available);

        // Preferred order of high-performance text/chat models
        const preferences = [
          "llama-3.3-70b-versatile",
          "llama-3.1-70b-versatile",
          "llama-3.1-8b-instant",
          "llama3-70b-8192",
          "llama3-8b-8192",
          "deepseek-r1-distill-llama-70b",
          "mixtral-8x7b-32768",
          "gemma2-9b-it",
          "llama-3.2-3b-preview",
          "llama-3.2-1b-preview",
        ];

        for (const pref of preferences) {
          if (available.includes(pref) && !candidateModels.includes(pref)) {
            candidateModels.push(pref);
          }
        }

        // Add any remaining text/chat models (excluding speech/whisper/guard)
        for (const a of available) {
          if (
            !candidateModels.includes(a) &&
            !a.toLowerCase().includes("whisper") &&
            !a.toLowerCase().includes("guard")
          ) {
            candidateModels.push(a);
          }
        }
      } else {
        const err = await modelsResp.text();
        console.warn("Groq /models returned:", modelsResp.status, err);
      }
    } catch (e) {
      console.warn("Failed to query Groq /models:", e);
    }

    if (candidateModels.length === 0) {
      candidateModels = [
        "llama-3.3-70b-versatile",
        "llama-3.1-70b-versatile",
        "llama3-70b-8192",
        "llama3-8b-8192",
        "mixtral-8x7b-32768",
        "gemma2-9b-it",
      ];
    }

    console.log(`Executing Groq action '${action}' with candidate models:`, candidateModels);

    let lastError = "";
    let generatedText = "";

    for (const model of candidateModels) {
      try {
        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqApiKey.trim()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: prompt },
            ],
            temperature: action === "ask" ? 0.2 : 0.3,
            max_tokens: 1500,
          }),
        });

        if (groqResponse.ok) {
          const groqData = await groqResponse.json();
          generatedText = groqData.choices?.[0]?.message?.content || "";
          if (generatedText) {
            console.log(`Successfully generated AI content using Groq model: ${model}`);
            break;
          }
        }

        const errText = await groqResponse.text();
        console.warn(`Groq model ${model} returned ${groqResponse.status}:`, errText);

        try {
          const parsed = JSON.parse(errText);
          lastError = parsed.error?.message || `Groq API error (${groqResponse.status})`;
        } catch {
          lastError = `Groq API error (${groqResponse.status}): ${errText}`;
        }

        // If auth failure or invalid key (401), stop immediately
        if (groqResponse.status === 401) {
          break;
        }
      } catch (fetchErr: any) {
        lastError = fetchErr?.message || "Network error contacting Groq API.";
      }
    }

    if (!generatedText) {
      return new Response(
        JSON.stringify({ error: lastError || "Failed to generate AI response from Groq. Please verify your GROQ_API_KEY." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 7. Sanitize output to guarantee 100% clean plain text (no markdown, LaTeX, HTML, tables)
    const sanitizedResult = cleanPlainText(generatedText);

    return new Response(
      JSON.stringify({ success: true, action, result: sanitizedResult }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Unexpected error in ai-toolkit function:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "An unexpected error occurred during AI processing." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
