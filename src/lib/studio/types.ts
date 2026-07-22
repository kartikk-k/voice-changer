import type { OutputFormat, TimestampsResponse } from "@/lib/elevenlabs";

/** Which main content tab is active. */
export type MainTab = "input" | "transcript" | "audio";

/** Which settings sub-tab is active. */
export type SettingsTab = "credentials" | "voice" | "rephrase";

/** All persisted user settings for the studio. */
export interface AppSettings {
  elevenLabsApiKey: string;
  vercelGatewayKey: string;
  aiModel: string;
  voiceId: string;
  stability: number;
  similarityBoost: number;
  speed: number;
  outputFormat: OutputFormat;
  defaultSilence: number;
  grammarInstructions: string;
  cleanupEnabled: boolean;
  cleanupInstructions: string;
  aggressiveRephraseEnabled: boolean;
  aggressiveRephraseInstructions: string;
}

/** Update a single settings field in a type-safe way. */
export type UpdateSetting = <K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K],
) => void;

/** One generated segment, with the timing metadata ElevenLabs returned. */
export interface GeneratedSegment {
  index: number;
  start: string;
  end: string;
  speaker: string;
  targetDuration: number;
  generatedDuration: number;
  gapAfter: number;
  text: string;
  requestId: string | null;
  alignment?: TimestampsResponse["alignment"];
}
