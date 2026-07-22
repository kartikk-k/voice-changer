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

/** Root page composing the settings panel, main tab bar, and active content tab. */
export default function Home() {
  // Navigation
  const [mainTab, setMainTab] = useState<MainTab>("input");
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("credentials");

  // State management
  const { settings, updateSetting } = useSettings();
  const studio = useStudio(settings, setMainTab);

  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="flex min-h-dvh bg-white items-start justify-center py-4 px-4 lg:py-6 lg:px-6">
      <div className="flex w-full flex-col lg:flex-row gap-4 lg:gap-4">
        {/* ─── Mobile settings toggle ─── */}
        <button
          type="button"
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="flex items-center gap-2 self-start rounded-[99px] bg-[#f7f7f7] px-4 py-2 text-[14px] text-black lg:hidden"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Settings
        </button>

        {/* ─── Settings Panel (left) ─── */}
        <div className={`${settingsOpen ? "block" : "hidden"} lg:block`}>
          <SettingsPanel
            settings={settings}
            onUpdate={updateSetting}
            settingsTabs={SETTINGS_TABS_TRANSCRIPT}
            activeSettingsTab={settingsTab}
            onSettingsTabChange={setSettingsTab}
            title="Settings and Control"
          />
        </div>

        {/* ─── Right Area ─── */}
        <div className="flex items-start justify-center flex-1 min-w-0">
          <div className="flex flex-col gap-2 w-full max-w-3xl">
            {/* Main tab bar */}
            <div className="w-full max-w-xl mx-auto">
              <PillTabBar
                tabs={MAIN_TABS}
                active={mainTab}
                onChange={setMainTab}
                size="sm"
              />
            </div>

            {/* Right content area */}
            <div className="flex flex-col gap-2">
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
