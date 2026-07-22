"use client";

import type {
  AppSettings,
  SettingsTab,
  UpdateSetting,
} from "@/lib/studio/types";
import { PillTabBar } from "@/components/ui";
import { CredentialsPanel } from "./CredentialsPanel";
import { VoicePanel } from "./VoicePanel";
import { RephrasePanel } from "./RephrasePanel";

export function SettingsPanel({
  settings,
  onUpdate,
  settingsTabs,
  activeSettingsTab,
  onSettingsTabChange,
  title,
}: {
  settings: AppSettings;
  onUpdate: UpdateSetting;
  settingsTabs: { key: SettingsTab; label: string }[];
  activeSettingsTab: SettingsTab;
  onSettingsTabChange: (tab: SettingsTab) => void;
  title: string;
}) {
  return (
    <div className="flex w-full lg:w-[480px] lg:sticky lg:top-6 shrink-0 flex-col gap-[14px] overflow-clip rounded-[20px] border border-[rgba(0,0,0,0.1)] p-[8px] self-start lg:max-h-[923px]">
      {/* Title area */}
      <div className="pl-[12px] pr-[6px] pt-[6px]">
        <h2 className="text-sm font-medium text-black">
          {title}
        </h2>
        <p className="text-xs opacity-50">
          Voice and generation options
        </p>
      </div>

      {/* Settings sub-tabs */}
      <PillTabBar
        tabs={settingsTabs}
        active={activeSettingsTab}
        onChange={onSettingsTabChange}
        size="lg"
      />

      {/* Settings content */}
      <div className="flex flex-col gap-[8px] overflow-y-auto">
        {activeSettingsTab === "credentials" && (
          <CredentialsPanel settings={settings} onUpdate={onUpdate} />
        )}
        {activeSettingsTab === "voice" && (
          <VoicePanel settings={settings} onUpdate={onUpdate} />
        )}
        {activeSettingsTab === "rephrase" && (
          <RephrasePanel settings={settings} onUpdate={onUpdate} />
        )}
      </div>
    </div>
  );
}
