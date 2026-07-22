"use client";

import { GapIndicator, PillButton } from "@/components/ui";
import { MetricsBar } from "@/components/common/MetricsBar";
import { SegmentCard } from "@/components/common/SegmentCard";
import { formatDuration } from "@/lib/studio/format";
import type { Segment } from "@/lib/subtitles";

/** Transcript tab showing parsed segments with grammar/cleanup and audio generation actions. */
export function TranscriptTab({
  segments,
  getSegmentText,
  editedTexts,
  summary,
  onFixGrammarAndCleanup,
  isProcessingAi,
  aiStatus,
  onGenerateAudio,
  isGenerating,
  generateStatus,
}: {
  segments: Segment[];
  getSegmentText: (seg: Segment) => string;
  editedTexts: Record<number, string>;
  summary: { totalSilence: number; originalDuration: number };
  onFixGrammarAndCleanup: () => void;
  isProcessingAi: boolean;
  aiStatus: string;
  onGenerateAudio: () => void;
  isGenerating: boolean;
  generateStatus: string;
}) {
  if (!segments.length) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-[15px] opacity-60">
          No transcript yet. Go to the Input tab and generate one.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[8px]">
      {/* Metrics bar */}
      <MetricsBar
        metrics={[
          { label: "Segments", value: String(segments.length) },
          {
            label: "Original duration",
            value: formatDuration(summary.originalDuration),
          },
          {
            label: "Silence inserted",
            value: formatDuration(summary.totalSilence),
          },
        ]}
      />

      {/* AI status */}
      {aiStatus && (
        <p className="px-[12px] text-[12px] opacity-50">{aiStatus}</p>
      )}

      {/* Segment cards */}
      {segments.map((seg, i) => (
        <div key={seg.index}>
          <SegmentCard
            speaker={seg.speaker}
            start={seg.start}
            end={seg.end}
            text={getSegmentText(seg)}
            meta={`${seg.targetDuration.toFixed(2)}s`}
            edited={editedTexts[seg.index] !== undefined}
          />
          {i < segments.length - 1 && seg.gapAfter > 0 && (
            <div className="px-[12px]">
              <GapIndicator label={`+${seg.gapAfter.toFixed(2)}s gap`} />
            </div>
          )}
        </div>
      ))}

      {/* Bottom action bar */}
      <div className="flex gap-[10px] border-t border-[rgba(0,0,0,0.1)] pt-[14px]">
        <PillButton
          onClick={onFixGrammarAndCleanup}
          disabled={isProcessingAi}
        >
          {isProcessingAi ? "Processing..." : "Fix Grammar & Cleanup"}
        </PillButton>
        <PillButton
          variant="blue"
          onClick={onGenerateAudio}
          disabled={isGenerating || isProcessingAi}
        >
          {isGenerating ? "Generating..." : "Generate Audio"}
        </PillButton>
      </div>

      {/* Generate status */}
      {generateStatus && (
        <p className="px-[12px] text-[12px] opacity-50">{generateStatus}</p>
      )}
    </div>
  );
}
