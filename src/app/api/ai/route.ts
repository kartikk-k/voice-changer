import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { NextResponse } from "next/server";

/** Server-side route that proxies grammar/cleanup requests to the Vercel AI Gateway. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      text,
      model,
      apiKey,
      grammarEnabled,
      grammarInstructions,
      cleanupEnabled,
      cleanupInstructions,
    } = body;

    if (!text || !apiKey) {
      return NextResponse.json(
        { error: "Missing required fields: text, apiKey" },
        { status: 400 },
      );
    }

    // Build a combined system prompt from enabled features
    const parts: string[] = [];

    parts.push(
      "You are a transcript editing assistant. You will receive transcript segments in the format `[index | duration: Xs | gap_after: Xs] text`. " +
        "The duration is how long the segment lasts in the audio. The gap_after is the silence gap before the next segment starts.\n\n" +
        "You MUST return the result in EXACTLY the format: `[index] edited text`, one per line (do NOT include duration/gap in the output). " +
        "Preserve the index numbers exactly as given. " +
        "If a segment's text becomes completely empty after your edits (e.g. it was only filler words), return it as `[index]` with no text after the index.\n\n" +
        "## Critical constraints\n" +
        "- NEVER change the meaning or intent of a sentence. The edited text must convey the same information.\n" +
        "- NEVER drastically increase or decrease the length of the text. Each segment maps to a specific time window. " +
        "If the original is 2 short sentences, the result should be roughly 2 short sentences — not 5 sentences, not half a sentence.\n" +
        "- You MAY add a few words to improve clarity, but ONLY if there is enough gap_after to absorb the extra speaking time. " +
        "If gap_after is 0s, do NOT make the text longer at all — it must fit within the segment's duration. " +
        "If gap_after is 1–3s, you can add a few words if it genuinely improves the sentence. Never add more than what the gap could absorb.\n" +
        "- Keep the tone natural and conversational. This is spoken audio, not written prose.",
    );

    if (grammarEnabled) {
      parts.push(
        "\n\n## Grammar\n" +
          "Fix smaller grammatical issues: punctuation, spelling, subject-verb agreement, tense consistency. " +
          "Do NOT rewrite or rephrase sentences. Only correct errors. Keep it natural and spoken.",
      );
      if (grammarInstructions) {
        parts.push(
          `Additional grammar instructions from the user:\n${grammarInstructions}`,
        );
      }
    }

    if (cleanupEnabled) {
      parts.push(
        "\n\n## Cleanup\n" +
          'Remove filler words and verbal artifacts that do not contribute meaning: "uh", "um", "like" (when used as filler), "you know", false starts, repeated words, and stutters (e.g. "th-that" → "that", "press, press" → "press"). ' +
          "Remove bracketed cues that represent non-speech sounds like [lip smack], [cough], [sigh], [laughter], etc. " +
          'If removing these items leaves the segment completely empty (e.g. a segment that was only "Uh,"), return it as `[index]` with no text. The system will automatically insert silence for that segment\'s duration. ' +
          "If the filler is embedded within a longer sentence, just remove the filler word and let the surrounding text flow naturally. " +
          "Do NOT add new words or expand the text to fill the gap left by removed fillers. The resulting text should be shorter or equal, never longer.",
      );
      if (cleanupInstructions) {
        parts.push(
          `Additional cleanup instructions from the user:\n${cleanupInstructions}`,
        );
      }
    }

    if (!grammarEnabled && !cleanupEnabled) {
      return NextResponse.json(
        { error: "Enable at least Grammar or Clean up in settings." },
        { status: 400 },
      );
    }

    const systemPrompt = parts.join("\n");

    // Use Vercel AI Gateway via @ai-sdk/openai
    const gateway = createOpenAI({
      baseURL: "https://ai-gateway.vercel.sh/v1",
      apiKey,
    });

    const { text: result } = await generateText({
      model: gateway(model || "xai/grok-4.1-fast-non-reasoning"),
      system: systemPrompt,
      prompt: text,
      maxOutputTokens: 8192,
    });

    return NextResponse.json({ result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
