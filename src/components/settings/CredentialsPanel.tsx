"use client";

import type { AppSettings, UpdateSetting } from "@/lib/studio/types";
import { AI_MODELS } from "@/lib/studio/constants";
import {
  SettingsCard,
  SettingsField,
  SettingsInput,
  SettingsSelect,
} from "@/components/ui";

/** Credentials settings sub-panel for API keys and AI model selection. */
export function CredentialsPanel({
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
          label="ElevenLabs API key"
          htmlFor="elevenLabsApiKey"
          description="Used to convert voice into transcript and to generate voice"
          link={{ text: "Generate API Key", href: "https://elevenlabs.io/app/settings/api-keys" }}
        >
          <SettingsInput
            id="elevenLabsApiKey"
            type="password"
            autoComplete="off"
            placeholder="sk_xxxx..."
            value={settings.elevenLabsApiKey}
            onChange={(e) => onUpdate("elevenLabsApiKey", e.target.value)}
          />
        </SettingsField>
      </SettingsCard>

      <SettingsCard>
        <SettingsField
          label="Vercel AI Gateway"
          htmlFor="vercelGatewayKey"
          badge="Optional"
          description="Used for Grammar and Rephrase"
          link={{ text: "Generate API Key", href: "https://console.anthropic.com/settings/keys" }}
        >
          <SettingsInput
            id="vercelGatewayKey"
            type="password"
            autoComplete="off"
            placeholder="sk_xxxx..."
            value={settings.vercelGatewayKey}
            onChange={(e) => onUpdate("vercelGatewayKey", e.target.value)}
          />
        </SettingsField>
      </SettingsCard>

      <SettingsCard>
        <SettingsField
          label="Model"
          htmlFor="aiModel"
          badge="Optional"
          description="AI model preferred for grammar and rephrase"
          link={{ text: "View all models", href: "https://docs.anthropic.com/en/docs/about-claude/models" }}
        >
          <SettingsSelect
            id="aiModel"
            value={settings.aiModel}
            onChange={(e) => onUpdate("aiModel", e.target.value)}
          >
            {AI_MODELS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </SettingsSelect>
        </SettingsField>
      </SettingsCard>
    </>
  );
}
