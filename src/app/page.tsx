"use client";

import { useState } from "react";

import { PillTabBar } from "@/components/ui";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { InputTab } from "@/components/tabs/InputTab";
import { TranscriptTab } from "@/components/tabs/TranscriptTab";
import { AudioTab } from "@/components/tabs/AudioTab";
import { useSettings } from "@/hooks/useSettings";
import { useStudio } from "@/hooks/useStudio";
import { useTheme } from "@/hooks/useTheme";
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
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-dvh bg-surface items-start justify-center py-4 px-4 lg:py-6 lg:px-6">
      {/* ─── Theme toggle (top-right) ─── */}
      <button
        type="button"
        onClick={toggleTheme}
        className="fixed right-4 top-4 z-20 flex size-9 items-center justify-center rounded-full bg-surface-alt text-fg-muted transition-colors hover:text-fg"
        aria-label={`Theme: ${theme}`}
        title={`Theme: ${theme} (click to cycle)`}
      >
        {theme === "light" ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><g fill="currentColor"><path d="M9,3c.414,0,.75-.336,.75-.75V.75c0-.414-.336-.75-.75-.75s-.75,.336-.75,.75v1.5c0,.414,.336,.75,.75,.75Z" /><path d="M13.773,4.977c.192,0,.384-.073,.53-.22l1.061-1.061c.293-.293,.293-.768,0-1.061s-.768-.293-1.061,0l-1.061,1.061c-.293,.293-.293,.768,0,1.061,.146,.146,.338,.22,.53,.22Z" /><path d="M17.25,8.25h-1.5c-.414,0-.75,.336-.75,.75s.336,.75,.75,.75h1.5c.414,0,.75-.336,.75-.75s-.336-.75-.75-.75Z" /><path d="M14.303,13.243c-.293-.293-.768-.293-1.061,0s-.293,.768,0,1.061l1.061,1.061c.146,.146,.338,.22,.53,.22s.384-.073,.53-.22c.293-.293,.293-.768,0-1.061l-1.061-1.061Z" /><path d="M9,15c-.414,0-.75,.336-.75,.75v1.5c0,.414,.336,.75,.75,.75s.75-.336,.75-.75v-1.5c0-.414-.336-.75-.75-.75Z" /><path d="M3.697,13.243l-1.061,1.061c-.293,.293-.293,.768,0,1.061,.146,.146,.338,.22,.53,.22s.384-.073,.53-.22l1.061-1.061c.293-.293,.293-.768,0-1.061s-.768-.293-1.061,0Z" /><path d="M3,9c0-.414-.336-.75-.75-.75H.75c-.414,0-.75,.336-.75,.75s.336,.75,.75,.75h1.5c.414,0,.75-.336,.75-.75Z" /><path d="M3.697,4.757c.146,.146,.338,.22,.53,.22s.384-.073,.53-.22c.293-.293,.293-.768,0-1.061l-1.061-1.061c-.293-.293-.768-.293-1.061,0s-.293,.768,0,1.061l1.061,1.061Z" /><circle cx="9" cy="9" r="5" /></g></svg>
        ) : theme === "dark" ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><g fill="currentColor"><path d="M16.705,10.223c-.246-.183-.579-.197-.838-.037-.868,.532-1.859,.813-2.867,.813-3.033,0-5.5-2.467-5.5-5.5,0-1.146,.354-2.247,1.023-3.186,.177-.249,.186-.581,.021-.839-.164-.258-.467-.386-.77-.334C3.994,1.847,1.25,5.152,1.25,9c0,4.411,3.589,8,8,8,3.638,0,6.819-2.461,7.735-5.986,.077-.296-.034-.609-.28-.791Z" /></g></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><g fill="currentColor"><path d="m13.6626,14.7681l-3.9126-.8694v-2.1487h-1.5v2.1487l-3.9126.8694c-.4043.0898-.6592.4902-.5693.8945s.4873.6572.8945.5693l4.3374-.9639,4.3374.9639c.0547.0122.1094.0181.1631.0181.3442,0,.6538-.2378.7314-.5874.0898-.4043-.165-.8047-.5693-.8945Z" strokeWidth="0" /><path d="m14.25,12.5H3.75c-1.5166,0-2.75-1.2334-2.75-2.75v-5c0-1.5166,1.2334-2.75,2.75-2.75h10.5c1.5166,0,2.75,1.2334,2.75,2.75v5c0,1.5166-1.2334,2.75-2.75,2.75ZM3.75,3.5c-.6895,0-1.25.5605-1.25,1.25v5c0,.6895.5605,1.25,1.25,1.25h10.5c.6895,0,1.25-.5605,1.25-1.25v-5c0-.6895-.5605-1.25-1.25-1.25H3.75Z" strokeWidth="0" /></g></svg>
        )}
      </button>

      <div className="flex w-full flex-col lg:flex-row gap-4 lg:gap-4">
        {/* ─── Mobile settings toggle ─── */}
        <button
          type="button"
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="flex items-center gap-2 self-start rounded-[99px] bg-surface-alt px-4 py-2 text-[14px] text-fg lg:hidden"
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
