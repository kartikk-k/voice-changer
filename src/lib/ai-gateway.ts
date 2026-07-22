/**
 * AI gateway client for grammar, cleanup, and rephrase operations.
 * Calls the Next.js API route which proxies to the Anthropic API.
 */

export type AiAction = "grammar" | "cleanup" | "rephrase";

export interface AiProcessRequest {
  text: string;
  action: AiAction;
  model: string;
  apiKey: string;
  grammarInstructions?: string;
  cleanupInstructions?: string;
  rephraseInstructions?: string;
}

export async function processWithAi(
  request: AiProcessRequest,
): Promise<string> {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `AI request failed (${response.status})`);
  }

  return data.result;
}
