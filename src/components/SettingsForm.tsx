import type { OutputFormat } from "@/lib/elevenlabs";
import type { CleanupMode } from "@/lib/subtitles";

import { Field, Select, TextInput } from "./ui";

/** Local (non-secret-persisted) copy of the ElevenLabs form fields. */
export interface FormState {
  apiKey: string;
  voiceId: string;
  modelId: string;
  outputFormat: OutputFormat;
  stability: number;
  similarityBoost: number;
  speed: number;
}

const OUTPUT_FORMATS: OutputFormat[] = [
  "mp3_44100_128",
  "mp3_44100_192",
  "pcm_44100",
  "wav_44100",
];

function GroupLabel({ children }: { children: string }) {
  return (
    <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted">
      {children}
    </p>
  );
}

/**
 * The compact settings column: credentials, model options, voice tuning, and
 * text cleanup. Stacks vertically to fit a narrow sidebar.
 */
export function SettingsForm({
  form,
  onFormChange,
  cleanup,
  onCleanupChange,
}: {
  form: FormState;
  onFormChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  cleanup: CleanupMode;
  onCleanupChange: (value: CleanupMode) => void;
}) {
  const number = (value: string) => Number(value);

  return (
    <div className="grid gap-5">
      <div className="grid gap-3">
        <GroupLabel>Credentials</GroupLabel>
        <Field label="ElevenLabs API key" htmlFor="apiKey">
          <TextInput
            id="apiKey"
            type="password"
            autoComplete="off"
            placeholder="xi-api-key"
            value={form.apiKey}
            onChange={(e) => onFormChange("apiKey", e.target.value)}
          />
        </Field>
        <Field label="Voice ID" htmlFor="voiceId">
          <TextInput
            id="voiceId"
            placeholder="e.g. EXAVITQu4vr4xnSDxMaL"
            value={form.voiceId}
            onChange={(e) => onFormChange("voiceId", e.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-3">
        <GroupLabel>Model</GroupLabel>
        <Field label="Model ID" htmlFor="modelId">
          <TextInput
            id="modelId"
            value={form.modelId}
            onChange={(e) => onFormChange("modelId", e.target.value)}
          />
        </Field>
        <Field label="Output format" htmlFor="outputFormat">
          <Select
            id="outputFormat"
            value={form.outputFormat}
            onChange={(e) =>
              onFormChange("outputFormat", e.target.value as OutputFormat)
            }
          >
            {OUTPUT_FORMATS.map((format) => (
              <option key={format} value={format}>
                {format}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-3">
        <GroupLabel>Voice tuning</GroupLabel>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Stability" htmlFor="stability">
            <TextInput
              id="stability"
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={form.stability}
              onChange={(e) => onFormChange("stability", number(e.target.value))}
            />
          </Field>
          <Field label="Similarity" htmlFor="similarity">
            <TextInput
              id="similarity"
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={form.similarityBoost}
              onChange={(e) =>
                onFormChange("similarityBoost", number(e.target.value))
              }
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Speed" htmlFor="speed">
            <TextInput
              id="speed"
              type="number"
              min={0.7}
              max={1.2}
              step={0.05}
              value={form.speed}
              onChange={(e) => onFormChange("speed", number(e.target.value))}
            />
          </Field>
          <Field label="Cleanup" htmlFor="cleanup">
            <Select
              id="cleanup"
              value={cleanup}
              onChange={(e) => onCleanupChange(e.target.value as CleanupMode)}
            >
              <option value="off">As-is</option>
              <option value="light">Light</option>
            </Select>
          </Field>
        </div>
      </div>
    </div>
  );
}
