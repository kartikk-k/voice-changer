import type { Segment } from "@/lib/subtitles";

import { Chip } from "./ui";

interface CleanedSegment {
  segment: Segment;
  cleanText: string;
}

/** Read-only list of parsed segments with raw vs. cleaned text and timing. */
export function SegmentPreview({ segments }: { segments: CleanedSegment[] }) {
  if (!segments.length) {
    return (
      <div className="rounded-lg border border-border-strong bg-surface-2 px-4 py-3 text-sm text-text">
        No valid segments found. Paste subtitle-style blocks like{" "}
        <code className="font-mono">00:00:00,080 --&gt; 00:00:06,000</code>{" "}
        followed by the transcript text.
      </div>
    );
  }

  return (
    <ol className="divide-y divide-border">
      {segments.map(({ segment, cleanText }) => (
        <li key={segment.index} className="flex gap-4 py-4 first:pt-0 last:pb-0">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-surface-2 text-xs font-semibold text-muted">
            {segment.index + 1}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-muted">
                {segment.start} → {segment.end}
              </span>
              <Chip>{segment.targetDuration}s</Chip>
              {segment.gapAfter > 0 ? (
                <Chip>+{segment.gapAfter}s gap</Chip>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-text">
              {cleanText || (
                <span className="italic text-muted">(empty after cleanup)</span>
              )}
            </p>
            {cleanText && cleanText !== segment.rawText ? (
              <p className="mt-1 text-xs text-muted line-through decoration-muted/50">
                {segment.rawText}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
