import type { OutputFormat } from "@/lib/elevenlabs";
import type { AppSettings, MainTab, SettingsTab } from "@/lib/studio/types";

/** localStorage key used to persist {@link AppSettings}. */
export const STORAGE_KEY = "voix-studio-settings";

/** Factory defaults for all studio settings. */
export const DEFAULT_SETTINGS: AppSettings = {
  elevenLabsApiKey: "",
  vercelGatewayKey: "",
  aiModel: "xai/grok-4.1-fast-non-reasoning",
  voiceId: "",
  stability: 0.35,
  similarityBoost: 0.75,
  speed: 1,
  outputFormat: "mp3_44100_128",
  defaultSilence: 0.5,
  grammarEnabled: true,
  grammarInstructions: "",
  cleanupEnabled: true,
  cleanupInstructions: "",
};

/** Tab definitions for the main content area. */
export const MAIN_TABS: { key: MainTab; label: string }[] = [
  { key: "input", label: "Input" },
  { key: "transcript", label: "Transcript" },
  { key: "audio", label: "Audio" },
];

/** Settings sub-tabs shown when the Transcript or Audio main tab is active. */
export const SETTINGS_TABS_TRANSCRIPT: { key: SettingsTab; label: string }[] = [
  { key: "credentials", label: "Credentials" },
  { key: "voice", label: "Voice" },
  { key: "rephrase", label: "Rephrase & Grammar" },
];

/** Available ElevenLabs output format options. */
export const OUTPUT_FORMATS: OutputFormat[] = [
  "mp3_44100_128",
  "mp3_44100_192",
  "pcm_44100",
  "wav_44100",
];

/** Selectable AI models for grammar and cleanup via Vercel AI Gateway. */
export const AI_MODELS = [
  { value: "xai/grok-4.1-fast-non-reasoning", label: "Grok 4.1 Fast" },
  { value: "claude-sonnet-4-5-20250514", label: "Sonnet 4.5" },
  { value: "claude-haiku-4-5-20251001", label: "Haiku 4.5" },
  { value: "claude-opus-4-6-20250710", label: "Opus 4.6" },
];
