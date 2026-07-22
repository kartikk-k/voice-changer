"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { PillButton } from "@/components/ui";
import { MetricsBar } from "@/components/common/MetricsBar";
import { formatDuration } from "@/lib/studio/format";
import type { GeneratedSegment } from "@/lib/studio/types";

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function AudioTab({
  audioUrl,
  generatedSegments,
  finalDuration,
  summary,
  speed,
  onSpeedChange,
  onDownload,
  isGenerating,
  generateStatus,
}: {
  audioUrl: string | null;
  generatedSegments: GeneratedSegment[];
  finalDuration: number | null;
  summary: { totalSilence: number; originalDuration: number };
  speed: number;
  onSpeedChange: (v: number) => void;
  onDownload: () => void;
  isGenerating: boolean;
  generateStatus: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Sync playback speed to audio element
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioUrl]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }, []);

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const bar = progressRef.current;
    if (!audio || !bar) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!audioUrl && !isGenerating) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-[15px] opacity-60">
          No audio generated yet. Go to the Transcript tab and generate audio.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Metrics */}
      {finalDuration !== null && (
        <MetricsBar
          metrics={[
            { label: "Segments", value: String(generatedSegments.length) },
            {
              label: "Original duration",
              value: formatDuration(summary.originalDuration),
            },
            {
              label: "Final duration",
              value: formatDuration(finalDuration),
            },
          ]}
        />
      )}

      {/* Hidden native audio element */}
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}

      {/* Custom audio player */}
      {audioUrl && (
        <div className="rounded-[16px] bg-[#f7f7f7] p-5">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button
              type="button"
              onClick={togglePlay}
              className="flex size-[44px] shrink-0 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-black/80"
            >
              {isPlaying ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="3" y="2" width="4" height="12" rx="1" />
                  <rect x="9" y="2" width="4" height="12" rx="1" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4 2.5L13 8L4 13.5V2.5Z" />
                </svg>
              )}
            </button>

            {/* Time + Progress */}
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[13px] tabular-nums text-black">
                  {formatTime(currentTime)}
                </span>
                <span className="text-[13px] tabular-nums text-[#808080]">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Progress bar */}
              <div
                ref={progressRef}
                onClick={seek}
                className="group relative h-[6px] w-full cursor-pointer rounded-full bg-[rgba(0,0,0,0.1)]"
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-black transition-all"
                  style={{ width: `${progress}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 size-[14px] rounded-full bg-black opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                  style={{ left: `calc(${progress}% - 7px)` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Speed control */}
      {audioUrl && (
        <div className="rounded-[16px] border border-[rgba(0,0,0,0.1)] p-4">
          <p className="mb-3 text-[13px] text-black">Playback speed</p>
          <div className="flex gap-2">
            {SPEED_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  onSpeedChange(s);
                  if (audioRef.current) audioRef.current.playbackRate = s;
                }}
                className={`flex-1 rounded-[10px] py-2 text-[13px] font-medium transition-colors ${
                  speed === s
                    ? "bg-black text-white"
                    : "bg-[#f7f7f7] text-black hover:bg-[#eee]"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Status */}
      {generateStatus && (
        <p className="px-3 text-[12px] opacity-50">{generateStatus}</p>
      )}

      {/* Download */}
      {audioUrl && (
        <div className="flex gap-2.5 border-t border-[rgba(0,0,0,0.1)] pt-3.5">
          <PillButton onClick={onDownload}>
            Download Audio
          </PillButton>
        </div>
      )}
    </div>
  );
}
