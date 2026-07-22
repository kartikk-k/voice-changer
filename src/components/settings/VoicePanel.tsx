"use client";

import type { OutputFormat } from "@/lib/elevenlabs";
import type { AppSettings, UpdateSetting } from "@/lib/studio/types";
import { OUTPUT_FORMATS } from "@/lib/studio/constants";
import {
  SettingsCard,
  SettingsField,
  SettingsInput,
  SettingsSelect,
} from "@/components/ui";

/** Voice settings sub-panel for voice ID, stability, similarity, speed, and output format. */
export function VoicePanel({
  settings,
  onUpdate,
}: {
  settings: AppSettings;
  onUpdate: UpdateSetting;
}) {
  return (
    <>
      <SettingsCard>
        <SettingsField
          label="Voice ID"
          htmlFor="voiceId"
          description="ElevenLabs voice identifier"
        >
          <SettingsInput
            id="voiceId"
            placeholder="e.g. EXAVITQu4vr4xnSDxMaL"
            value={settings.voiceId}
            onChange={(e) => onUpdate("voiceId", e.target.value)}
          />
        </SettingsField>
      </SettingsCard>

      <SettingsCard>
        <div className="grid grid-cols-2 gap-[12px]">
          <SettingsField label="Stability" htmlFor="stability">
            <SettingsInput
              id="stability"
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={settings.stability}
              onChange={(e) => onUpdate("stability", Number(e.target.value))}
            />
          </SettingsField>
          <SettingsField label="Similarity" htmlFor="similarityBoost">
            <SettingsInput
              id="similarityBoost"
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={settings.similarityBoost}
              onChange={(e) =>
                onUpdate("similarityBoost", Number(e.target.value))
              }
            />
          </SettingsField>
        </div>
      </SettingsCard>

      <SettingsCard>
        <div className="grid grid-cols-2 gap-[12px]">
          <SettingsField label="Speed" htmlFor="speed">
            <SettingsInput
              id="speed"
              type="number"
              min={0.7}
              max={1.2}
              step={0.05}
              value={settings.speed}
              onChange={(e) => onUpdate("speed", Number(e.target.value))}
            />
          </SettingsField>
          <SettingsField label="Output format" htmlFor="outputFormat">
            <SettingsSelect
              id="outputFormat"
              value={settings.outputFormat}
              onChange={(e) =>
                onUpdate("outputFormat", e.target.value as OutputFormat)
              }
            >
              {OUTPUT_FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </SettingsSelect>
          </SettingsField>
        </div>
      </SettingsCard>

      <SettingsCard>
        <SettingsField
          label="Default Silence"
          htmlFor="defaultSilence"
          description="Silence duration (seconds) between segments"
        >
          <SettingsInput
            id="defaultSilence"
            type="number"
            min={0}
            max={5}
            step={0.1}
            value={settings.defaultSilence}
            onChange={(e) =>
              onUpdate("defaultSilence", Number(e.target.value))
            }
          />
        </SettingsField>
      </SettingsCard>
    </>
  );
}
