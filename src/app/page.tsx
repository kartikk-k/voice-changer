"use client";

import { useState } from "react";

import { PillTabBar } from "@/components/ui";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { InputTab } from "@/components/tabs/InputTab";
import { TranscriptTab } from "@/components/tabs/TranscriptTab";
import { AudioTab } from "@/components/tabs/AudioTab";
import { useSettings } from "@/hooks/useSettings";
import { useStudio } from "@/hooks/useStudio";
import { MAIN_TABS, SETTINGS_TABS_TRANSCRIPT } from "@/lib/studio/constants";
import type { MainTab, SettingsTab } from "@/lib/studio/types";

export default function Home() {
  // Navigation
  const [mainTab, setMainTab] = useState<MainTab>("input");
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("credentials");

  // State management
  const { settings, updateSetting } = useSettings();
  const studio = useStudio(settings, setMainTab);

  // The settings panel is fixed: all tabs are always shown and its title never
  // changes, regardless of which main (right-side) tab is active.
  const currentSettingsTabs = SETTINGS_TABS_TRANSCRIPT;
  const activeSettingsTab = settingsTab;
  const settingsTitle = "Settings and Control";

  return (
    <div className="flex min-h-dvh bg-white items-start justify-center py-[24px] px-6">
      <div className="flex w-full gap-[16px]">
        {/* ─── Settings Panel (left) ─── */}
        <SettingsPanel
          settings={settings}
          onUpdate={updateSetting}
          settingsTabs={currentSettingsTabs}
          activeSettingsTab={activeSettingsTab}
          onSettingsTabChange={setSettingsTab}
          title={settingsTitle}
        />

        {/* ─── Right Area ─── */}
        <div className="flex items-center justify-center flex-1 h-fit">
          <div className="flex flex-col gap-[8px] max-w-3xl w-full">
            {/* Main tab bar */}
            <div className="self-start w-full max-w-xl mx-auto">
              <PillTabBar
                tabs={MAIN_TABS}
                active={mainTab}
                onChange={setMainTab}
                size="sm"
              />
            </div>

            {/* Right content area */}
            <div className="flex flex-col gap-[8px]">
              {mainTab === "input" && (
                <InputTab
                  rawInput={studio.rawInput}
                  onRawInputChange={studio.setRawInput}
                  uploadedFile={studio.uploadedFile}
                  onFileSelect={studio.selectFile}
                  onFileRemove={studio.removeFile}
                  onGenerate={studio.generateTranscript}
                  status={studio.generateStatus}
                  isTranscribing={studio.isTranscribing}
                />
              )}
              {mainTab === "transcript" && (
                <TranscriptTab
                  segments={studio.segments}
                  getSegmentText={studio.getSegmentText}
                  editedTexts={studio.editedTexts}
                  summary={studio.summary}
                  onFixGrammarAndCleanup={studio.fixGrammarAndCleanup}
                  isProcessingAi={studio.isProcessingAi}
                  aiStatus={studio.aiStatus}
                  onGenerateAudio={studio.generateAudio}
                  isGenerating={studio.isGenerating}
                  generateStatus={studio.generateStatus}
                />
              )}
              {mainTab === "audio" && (
                <AudioTab
                  audioUrl={studio.audioUrl}
                  generatedSegments={studio.generatedSegments}
                  finalDuration={studio.finalDuration}
                  summary={studio.summary}
                  speed={settings.speed}
                  onSpeedChange={(v) => updateSetting("speed", v)}
                  onDownload={studio.downloadWav}
                  isGenerating={studio.isGenerating}
                  generateStatus={studio.generateStatus}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
