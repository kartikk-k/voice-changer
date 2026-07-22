/**
 * Parsing and text utilities for SRT-style timestamped transcript blocks.
 *
 * A block looks like:
 *
 *   00:00:00,080 --> 00:00:06,000 [Speaker 0]
 *   [lip smack] Okay, so today we'll see, uh, the screen ...
 *
 * These helpers are pure (no DOM, no React) so they can be unit tested and
 * reused on either the server or the client.
 */

/** A single parsed transcript block. */
export interface Segment {
  /** Zero-based position within the transcript. */
  index: number;
  /** Raw start timestamp, e.g. `00:00:00,080`. */
  start: string;
  /** Raw end timestamp, e.g. `00:00:06,000`. */
  end: string;
  /** Speaker label without brackets, e.g. `Speaker 0`. Empty when absent. */
  speaker: string;
  /** Start time in seconds. */
  startSeconds: number;
  /** End time in seconds. */
  endSeconds: number;
  /** Intended spoken duration (`endSeconds - startSeconds`). */
  targetDuration: number;
  /** Original, unmodified transcript text. */
  rawText: string;
  /** Silence (in seconds) between this segment's end and the next one's start. */
  gapAfter: number;
}

/** Aggregate stats for a list of segments. */
export interface TimelineSummary {
  /** Total silence that will be inserted between segments. */
  totalSilence: number;
  /** Span from the first segment's start to the last segment's end. */
  originalDuration: number;
}

const TIMESTAMP = /(\d{2}):(\d{2}):(\d{2}),(\d{3})/;
const TIMING_LINE =
  /^(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})(?:\s*\[(.*?)\])?$/;

/** Convert an `HH:MM:SS,mmm` timestamp to seconds, or `null` if malformed. */
function timeToSeconds(value: string): number | null {
  const match = value.trim().match(TIMESTAMP);
  if (!match) return null;
  const [, h, m, s, ms] = match;
  return Number(h) * 3600 + Number(m) * 60 + Number(s) + Number(ms) / 1000;
}

/**
 * Parse SRT-style blocks into structured {@link Segment}s. Invalid or
 * incomplete blocks are skipped. `gapAfter` is derived from the next segment.
 */
export function parseSubtitleBlocks(input: string): Segment[] {
  const lines = input.replace(/\r/g, "").split("\n");
  const segments: Omit<Segment, "gapAfter">[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) {
      i += 1;
      continue;
    }

    const timing = line.match(TIMING_LINE);
    if (!timing) {
      i += 1;
      continue;
    }

    const [, start, end, speaker = ""] = timing;
    i += 1;

    const textLines: string[] = [];
    while (i < lines.length && lines[i].trim()) {
      textLines.push(lines[i].trim());
      i += 1;
    }

    const rawText = textLines.join(" ").replace(/\s+/g, " ").trim();
    const startSeconds = timeToSeconds(start);
    const endSeconds = timeToSeconds(end);

    if (
      rawText &&
      Number.isFinite(startSeconds) &&
      Number.isFinite(endSeconds) &&
      startSeconds !== null &&
      endSeconds !== null
    ) {
      segments.push({
        index: segments.length,
        start,
        end,
        speaker,
        startSeconds,
        endSeconds,
        targetDuration: Number((endSeconds - startSeconds).toFixed(3)),
        rawText,
      });
    }
  }

  return segments.map((segment, index, all) => {
    const next = all[index + 1];
    const gapAfter = next
      ? Number((next.startSeconds - segment.endSeconds).toFixed(3))
      : 0;
    return { ...segment, gapAfter: Math.max(0, gapAfter) };
  });
}

/** Summarise total silence and original duration for a list of segments. */
export function summarizeTimeline(segments: Segment[]): TimelineSummary {
  const totalSilence = segments.reduce((sum, seg) => sum + seg.gapAfter, 0);
  const originalDuration = segments.length
    ? segments[segments.length - 1].endSeconds - segments[0].startSeconds
    : 0;
  return { totalSilence, originalDuration };
}
