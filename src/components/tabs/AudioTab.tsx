"use client";

import { GapIndicator, PillButton } from "@/components/ui";
import { MetricsBar } from "@/components/common/MetricsBar";
import { SegmentCard } from "@/components/common/SegmentCard";
import { formatDuration } from "@/lib/studio/format";
import type { GeneratedSegment } from "@/lib/studio/types";

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
    <div className="flex flex-col gap-[8px]">
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

      {/* Player */}
      {audioUrl && (
        <div className="rounded-[16px] border border-[rgba(0,0,0,0.1)] p-[12px]">
          <audio controls src={audioUrl} className="w-full" />
        </div>
      )}

      {/* Speed control */}
      <div className="rounded-[16px] border border-[rgba(0,0,0,0.1)] p-[12px]">
        <div className="flex items-center gap-[12px]">
          <span className="text-xs text-black">Playback speed</span>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.1}
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="flex-1"
          />
          <span className="min-w-[3ch] text-right text-xs text-[#808080] tabular-nums">
            {speed}x
          </span>
        </div>
      </div>

      {/* Status */}
      {generateStatus && (
        <p className="px-[12px] text-[12px] opacity-50">{generateStatus}</p>
      )}

      {/* Generated segments */}
      {generatedSegments.length > 0 &&
        generatedSegments.map((seg, i) => (
          <div key={seg.index}>
            <SegmentCard
              speaker={seg.speaker}
              start={seg.start}
              end={seg.end}
              text={seg.text}
              meta={`${seg.generatedDuration.toFixed(2)}s generated`}
            />
            {i < generatedSegments.length - 1 && seg.gapAfter > 0 && (
              <div className="px-[12px]">
                <GapIndicator label={`+${seg.gapAfter.toFixed(2)}s gap`} />
              </div>
            )}
          </div>
        ))}

      {/* Download */}
      <div className="flex gap-[10px] border-t border-[rgba(0,0,0,0.1)] pt-[14px]">
        <PillButton onClick={onDownload} disabled={!audioUrl}>
          Download WAV
        </PillButton>
      </div>
    </div>
  );
}
