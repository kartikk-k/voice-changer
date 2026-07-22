import { NextResponse } from "next/server";

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
      "You are a transcript editing assistant. You will receive transcript segments in the format `[index] text`. " +
      "You MUST return the result in EXACTLY the same format: `[index] edited text`, one per line. " +
      "Preserve the index numbers exactly as given. " +
      "If a segment's text becomes completely empty after your edits (e.g. it was only filler words), return it as `[index]` with no text after the index."
    );

    if (grammarEnabled) {
      parts.push(
        "\n\n## Grammar\n" +
        "Fix smaller grammatical issues: punctuation, spelling, subject-verb agreement, tense consistency. " +
        "Do NOT change the meaning, tone, or phrasing. Keep it natural and spoken."
      );
      if (grammarInstructions) {
        parts.push(`Additional grammar instructions from the user:\n${grammarInstructions}`);
      }
    }

    if (cleanupEnabled) {
      parts.push(
        "\n\n## Cleanup\n" +
        "Remove filler words and verbal artifacts that do not contribute meaning: \"uh\", \"um\", \"like\" (when used as filler), \"you know\", false starts, repeated words, and stutters (e.g. \"th-that\" → \"that\", \"press, press\" → \"press\"). " +
        "Remove bracketed cues that represent non-speech sounds like [lip smack], [cough], [sigh], [laughter], etc. " +
        "IMPORTANT: If removing these items leaves the segment completely empty (e.g. a segment that was only \"Uh,\"), return it as `[index]` with no text. The system will automatically insert silence for that segment's duration. " +
        "If the filler is embedded within a longer sentence, just remove the filler word and let the surrounding text flow naturally — the audio generation will handle the pacing."
      );
      if (cleanupInstructions) {
        parts.push(`Additional cleanup instructions from the user:\n${cleanupInstructions}`);
      }
    }

    if (!grammarEnabled && !cleanupEnabled) {
      return NextResponse.json(
        { error: "Enable at least Grammar or Clean up in settings." },
        { status: 400 },
      );
    }

    const systemPrompt = parts.join("\n");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model || "claude-sonnet-4-5-20250514",
        max_tokens: 8192,
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
