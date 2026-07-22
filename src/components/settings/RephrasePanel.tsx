"use client";

import type { AppSettings, UpdateSetting } from "@/lib/studio/types";
import {
  SettingsCard,
  SettingsField,
  SettingsTextarea,
  Toggle,
} from "@/components/ui";

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
          label="Grammer"
          htmlFor="grammarInstructions"
          badge="Optional"
          description="Rules or patterns to ignore"
          link={{ text: "Additional instructions", href: "#" }}
        >
          <SettingsTextarea
            id="grammarInstructions"
            placeholder="- Follow British English..."
            value={settings.grammarInstructions}
            onChange={(e) =>
              onUpdate("grammarInstructions", e.target.value)
            }
          />
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
          <SettingsTextarea
            id="cleanupInstructions"
            placeholder="- Remove all Uh.."
            value={settings.cleanupInstructions}
            onChange={(e) =>
              onUpdate("cleanupInstructions", e.target.value)
            }
          />
        </SettingsField>
      </SettingsCard>

      {/* Aggressive rephrase card */}
      <SettingsCard>
        <SettingsField
          label="Aggressive rephrase"
          htmlFor="aggressiveRephraseInstructions"
          description="Instructions for AI model to follow when rewriting transcript text"
          trailing={
            <Toggle
              checked={settings.aggressiveRephraseEnabled}
              onChange={(v) => onUpdate("aggressiveRephraseEnabled", v)}
            />
          }
        >
          {settings.aggressiveRephraseEnabled && (
            <SettingsTextarea
              id="aggressiveRephraseInstructions"
              placeholder="Rephrase for clarity..."
              value={settings.aggressiveRephraseInstructions}
              onChange={(e) =>
                onUpdate("aggressiveRephraseInstructions", e.target.value)
              }
            />
          )}
        </SettingsField>
      </SettingsCard>
    </>
  );
}
