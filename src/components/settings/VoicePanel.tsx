"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { OutputFormat } from "@/lib/elevenlabs";
import type { AppSettings, UpdateSetting } from "@/lib/studio/types";
import { OUTPUT_FORMATS } from "@/lib/studio/constants";
import { SettingsCard, SettingsField, SettingsInput, SettingsSelect } from "@/components/ui";

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  preview_url: string | null;
}

/** Voice settings sub-panel for voice selection, tuning, speed, and output format. */
export function VoicePanel({
  settings,
  onUpdate,
}: {
  settings: AppSettings;
  onUpdate: UpdateSetting;
}) {
  const [muted, setMuted] = useState(false);

  return (
    <>
      <SettingsCard>
        <SettingsField
          label="Voice"
          htmlFor="voiceId"
          description="Select an ElevenLabs voice"
          trailing={
            <button
              type="button"
              onClick={() => setMuted(!muted)}
              className="flex items-center justify-center opacity-50 hover:opacity-80 transition-opacity"
              aria-label={muted ? "Unmute voice preview" : "Mute voice preview"}
              title={muted ? "Unmute preview" : "Mute preview"}
            >
              {muted ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2L4 5.5H1.5V10.5H4L8 14V2Z" fill="currentColor" />
                  <path d="M12 5L14.5 7.5M14.5 5L12 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2L4 5.5H1.5V10.5H4L8 14V2Z" fill="currentColor" />
                  <path d="M11 5.5C11.8 6.3 12.2 7.3 12.2 8.2C12.2 9.1 11.8 10 11 10.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  <path d="M13 3.5C14.3 4.8 15 6.5 15 8.2C15 9.9 14.3 11.6 13 12.9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              )}
            </button>
          }
        >
          <VoiceSearchSelect
            apiKey={settings.elevenLabsApiKey}
            value={settings.voiceId}
            onChange={(id) => onUpdate("voiceId", id)}
            muted={muted}
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
              onChange={(e) => onUpdate("similarityBoost", Number(e.target.value))}
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
              onChange={(e) => onUpdate("outputFormat", e.target.value as OutputFormat)}
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
            onChange={(e) => onUpdate("defaultSilence", Number(e.target.value))}
          />
        </SettingsField>
      </SettingsCard>
    </>
  );
}

/** Searchable dropdown for selecting an ElevenLabs voice with keyboard nav and audio preview. */
function VoiceSearchSelect({
  apiKey,
  value,
  onChange,
  muted,
}: {
  apiKey: string;
  value: string;
  onChange: (voiceId: string) => void;
  muted: boolean;
}) {
  const [voices, setVoices] = useState<ElevenLabsVoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch voices when API key is available
  const fetchVoices = useCallback(async () => {
    if (!apiKey) {
      setError("Add API key first");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://api.elevenlabs.io/v1/voices", {
        headers: { "xi-api-key": apiKey },
      });
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const data = await res.json();
      setVoices(
        (data.voices || []).map(
          (v: { voice_id: string; name: string; preview_url?: string }) => ({
            voice_id: v.voice_id,
            name: v.name,
            preview_url: v.preview_url || null,
          }),
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load voices");
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    if (apiKey) fetchVoices();
  }, [apiKey, fetchVoices]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        stopPreview();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(() => {
    if (!search) return voices;
    const q = search.toLowerCase();
    return voices.filter((v) => v.name.toLowerCase().includes(q));
  }, [voices, search]);

  // Reset highlight when filtered list changes
  useEffect(() => {
    setHighlightIndex(-1);
  }, [filtered.length, search]);

  const selectedName = voices.find((v) => v.voice_id === value)?.name;

  // Audio preview
  const playPreview = useCallback(
    (previewUrl: string | null) => {
      if (muted || !previewUrl) return;
      stopPreview();
      const audio = new Audio(previewUrl);
      audio.volume = 0.5;
      audio.play().catch(() => {});
      audioRef.current = audio;
    },
    [muted],
  );

  const stopPreview = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  }, []);

  // Stop preview when muted changes
  useEffect(() => {
    if (muted) stopPreview();
  }, [muted, stopPreview]);

  // Play preview when highlight changes (keyboard nav)
  useEffect(() => {
    if (highlightIndex >= 0 && highlightIndex < filtered.length) {
      playPreview(filtered[highlightIndex].preview_url);
    }
  }, [highlightIndex, filtered, playPreview]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex < 0 || !listRef.current) return;
    const items = listRef.current.querySelectorAll("[data-voice-item]");
    items[highlightIndex]?.scrollIntoView({ block: "nearest" });
  }, [highlightIndex]);

  const selectVoice = useCallback(
    (voiceId: string) => {
      onChange(voiceId);
      setOpen(false);
      setSearch("");
      stopPreview();
    },
    [onChange, stopPreview],
  );

  // Keyboard handling
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault();
          setOpen(true);
          setSearch("");
          setTimeout(() => inputRef.current?.focus(), 0);
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightIndex((prev) =>
            prev < filtered.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightIndex((prev) =>
            prev > 0 ? prev - 1 : filtered.length - 1,
          );
          break;
        case "Enter":
          e.preventDefault();
          if (highlightIndex >= 0 && highlightIndex < filtered.length) {
            selectVoice(filtered[highlightIndex].voice_id);
          }
          break;
        case "Escape":
          e.preventDefault();
          setOpen(false);
          stopPreview();
          break;
      }
    },
    [open, filtered, highlightIndex, selectVoice, stopPreview],
  );

  return (
    <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          setSearch("");
          setHighlightIndex(-1);
          if (!open) setTimeout(() => inputRef.current?.focus(), 0);
          else stopPreview();
        }}
        className="flex w-full items-center justify-between rounded-[10px] bg-[#f7f7f7] px-[12px] py-[6px] text-left text-[14px] outline-none"
      >
        <span className={selectedName ? "text-black" : "text-[rgba(0,0,0,0.6)]"}>
          {selectedName || (loading ? "Loading..." : "Select a voice")}
        </span>
        <svg
          className={`shrink-0 opacity-50 transition-transform ${open ? "rotate-180" : ""}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-[12px] border border-[rgba(0,0,0,0.1)] bg-white shadow-[0px_4px_12px_rgba(0,0,0,0.08)]">
          {/* Search input */}
          <div className="border-b border-[rgba(0,0,0,0.06)] px-[10px] py-[8px]">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search voices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-[13px] text-black outline-none placeholder:text-[rgba(0,0,0,0.4)]"
            />
          </div>

          {/* Options */}
          <div ref={listRef} className="max-h-[200px] overflow-y-auto" role="listbox">
            {error && (
              <p className="px-[12px] py-[8px] text-[13px] text-red-500">{error}</p>
            )}
            {!error && filtered.length === 0 && (
              <p className="px-[12px] py-[8px] text-[13px] opacity-50">
                {loading ? "Loading voices..." : "No voices found"}
              </p>
            )}
            {filtered.map((v, i) => (
              <button
                key={v.voice_id}
                type="button"
                role="option"
                aria-selected={v.voice_id === value}
                data-voice-item
                onClick={() => selectVoice(v.voice_id)}
                onMouseEnter={() => {
                  setHighlightIndex(i);
                  playPreview(v.preview_url);
                }}
                onMouseLeave={() => stopPreview()}
                onFocus={() => {
                  setHighlightIndex(i);
                  playPreview(v.preview_url);
                }}
                className={`flex w-full items-center justify-between px-[12px] py-[8px] text-left text-[13px] transition-colors ${
                  i === highlightIndex
                    ? "bg-[#f0f0f0]"
                    : v.voice_id === value
                      ? "bg-[#f7f7f7]"
                      : "hover:bg-[#f7f7f7]"
                } ${v.voice_id === value ? "font-medium" : ""}`}
              >
                <span className="flex items-center gap-[6px]">
                  {v.name}
                  {v.preview_url && !muted && (
                    <svg
                      className={`opacity-0 transition-opacity ${i === highlightIndex ? "opacity-30" : ""}`}
                      width="10"
                      height="10"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path d="M4 2.5L13 8L4 13.5V2.5Z" />
                    </svg>
                  )}
                </span>
                {v.voice_id === value && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2.5 6L5 8.5L9.5 3.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
