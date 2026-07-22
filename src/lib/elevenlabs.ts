/**
 * Minimal client for the ElevenLabs "text to speech with timestamps" endpoint.
 *
 * The request is made directly from the browser using the user's own API key,
 * so nothing is proxied through this app's server.
 */

export type OutputFormat =
  | "mp3_44100_128"
  | "mp3_44100_192"
  | "pcm_44100"
  | "wav_44100";

/** Voice / model settings shared by the form and each request. */
export interface GenerationSettings {
  apiKey: string;
  voiceId: string;
  modelId: string;
  outputFormat: OutputFormat;
  stability: number;
  similarityBoost: number;
  speed: number;
}

/** Word/character-level timing returned alongside the audio. */
export interface Alignment {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

/** Successful response from the with-timestamps endpoint. */
export interface TimestampsResponse {
  audio_base64: string;
  alignment?: Alignment;
  normalized_alignment?: Alignment;
  request_id?: string;
  history_item_id?: string;
}

const BASE_URL = "https://api.elevenlabs.io/v1/text-to-speech";

interface ErrorBody {
  detail?: { message?: string } | string;
  message?: string;
}

/**
 * Generate speech for a single piece of text. `previousRequestIds` lets
 * ElevenLabs keep prosody consistent across consecutive segments.
 */
export async function generateSpeech(
  text: string,
  settings: GenerationSettings,
  previousRequestIds: string[] = [],
): Promise<TimestampsResponse> {
  const payload: Record<string, unknown> = {
    text,
    model_id: settings.modelId || "eleven_multilingual_v2",
    voice_settings: {
      stability: settings.stability,
      similarity_boost: settings.similarityBoost,
      speed: settings.speed,
    },
  };
  if (previousRequestIds.length) {
    payload.previous_request_ids = previousRequestIds;
  }

  const url =
    `${BASE_URL}/${encodeURIComponent(settings.voiceId)}/with-timestamps` +
    `?output_format=${encodeURIComponent(settings.outputFormat)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": settings.apiKey,
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as TimestampsResponse & ErrorBody;

  if (!response.ok) {
    const message =
      (typeof data.detail === "object" ? data.detail?.message : data.detail) ||
      data.message ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}
