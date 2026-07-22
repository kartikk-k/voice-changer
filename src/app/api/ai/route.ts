import { NextResponse } from "next/server";

const SYSTEM_PROMPTS: Record<string, string> = {
  grammar:
    "You are a grammar correction assistant. Fix grammar, punctuation, and spelling in the provided text. Keep the meaning and tone identical. Return ONLY the corrected text, nothing else.",
  cleanup:
    "You are a transcript cleanup assistant. Remove filler words (uh, um, like, you know), false starts, repeated words, and verbal tics from the transcript. Keep the meaning intact. Return ONLY the cleaned text, nothing else.",
  rephrase:
    "You are a transcript rephrase assistant. Aggressively rephrase the text to be concise, clear, and professional while preserving the core meaning. Remove all verbal artifacts, redundancies, and hesitations. Return ONLY the rephrased text, nothing else.",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      text,
      action,
      model,
      apiKey,
      grammarInstructions,
      cleanupInstructions,
      rephraseInstructions,
    } = body;

    if (!text || !action || !apiKey) {
      return NextResponse.json(
        { error: "Missing required fields: text, action, apiKey" },
        { status: 400 },
      );
    }

    let systemPrompt = SYSTEM_PROMPTS[action] || SYSTEM_PROMPTS.grammar;

    if (action === "grammar" && grammarInstructions) {
      systemPrompt += `\n\nAdditional instructions: ${grammarInstructions}`;
    }
    if (action === "cleanup" && cleanupInstructions) {
      systemPrompt += `\n\nAdditional instructions: ${cleanupInstructions}`;
    }
    if (action === "rephrase" && rephraseInstructions) {
      systemPrompt += `\n\nAdditional instructions: ${rephraseInstructions}`;
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model || "claude-sonnet-4-5-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: text }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message =
        data.error?.message || `Anthropic API error (${response.status})`;
      return NextResponse.json({ error: message }, { status: response.status });
    }

    const result =
      data.content?.[0]?.type === "text" ? data.content[0].text : "";

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
