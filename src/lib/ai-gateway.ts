/**
 * AI gateway client for grammar and cleanup operations.
 * Calls the Next.js API route which proxies to the Anthropic API.
 */

export interface AiFixRequest {
  text: string;
  model: string;
  apiKey: string;
  grammarEnabled: boolean;
  grammarInstructions: string;
  cleanupEnabled: boolean;
  cleanupInstructions: string;
}

export async function processWithAi(
  request: AiFixRequest,
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
