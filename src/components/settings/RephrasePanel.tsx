"use client";

import type { AppSettings, UpdateSetting } from "@/lib/studio/types";
import {
  SettingsCard,
  SettingsField,
  SettingsTextarea,
  Toggle,
} from "@/components/ui";

/** Rephrase and grammar settings sub-panel with toggleable instruction fields. */
export function RephrasePanel({
  settings,
  onUpdate,
}: {
  settings: AppSettings;
  onUpdate: UpdateSetting;
}) {
  return (
    <>
      {/* Grammar card */}
      <SettingsCard>
        <SettingsField
          label="Grammar"
          htmlFor="grammarInstructions"
          description="Rules or patterns to ignore"
          trailing={
            <Toggle
              checked={settings.grammarEnabled}
              onChange={(v) => onUpdate("grammarEnabled", v)}
            />
          }
        >
          {settings.grammarEnabled && (
            <SettingsTextarea
              id="grammarInstructions"
              placeholder="- Follow British English..."
              value={settings.grammarInstructions}
              onChange={(e) =>
                onUpdate("grammarInstructions", e.target.value)
              }
            />
          )}
        </SettingsField>
      </SettingsCard>

      {/* Clean up card */}
      <SettingsCard>
        <SettingsField
          label="Clean up"
          htmlFor="cleanupInstructions"
          description="Instructions for AI model to follow when rewriting transcript text"
          trailing={
            <Toggle
              checked={settings.cleanupEnabled}
              onChange={(v) => onUpdate("cleanupEnabled", v)}
            />
          }
        >
          {settings.cleanupEnabled && (
            <SettingsTextarea
              id="cleanupInstructions"
              placeholder="- Remove all Uh.."
              value={settings.cleanupInstructions}
              onChange={(e) =>
                onUpdate("cleanupInstructions", e.target.value)
              }
            />
          )}
        </SettingsField>
      </SettingsCard>
    </>
  );
}
