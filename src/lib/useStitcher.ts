"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import {
  audioBufferToWavBlob,
  decodeBase64Audio,
  downloadBlob,
  stitchTimeline,
  type StitchItem,
} from "@/lib/audio";
import {
  generateSpeech,
  type GenerationSettings,
  type TimestampsResponse,
} from "@/lib/elevenlabs";
import {
  cleanSegmentText,
  parseSubtitleBlocks,
  summarizeTimeline,
  type CleanupMode,
  type Segment,
} from "@/lib/subtitles";

export type StatusKind = "idle" | "info" | "success" | "error";

export interface Status {
  kind: StatusKind;
  message: string;
}

/** One generated segment, with the timing metadata ElevenLabs returned. */
export interface GeneratedSegment {
  index: number;
  start: string;
  end: string;
  targetDuration: number;
  generatedDuration: number;
  gapAfter: number;
  text: string;
  requestId: string | null;
  alignment?: TimestampsResponse["alignment"];
}

/** Full report describing a completed run, used for the JSON download. */
export interface RunReport {
  settings: Omit<GenerationSettings, "apiKey">;
  cleanup: CleanupMode;
  inputSegments: Segment[];
  generatedSegments: GeneratedSegment[];
  summary: {
    segmentCount: number;
    originalDuration: number;
    insertedSilence: number;
    finalWavDuration: number;
  };
}

const READY_STATUS: Status = {
  kind: "idle",
  message:
    "Ready. This tool makes one request per segment, inserts silence gaps, and combines everything into a browser-generated WAV file.",
};

/**
 * Holds the transcript, parses it into segments, and runs the
 * generate-and-stitch pipeline against ElevenLabs.
 */
export function useStitcher(initialTranscript: string) {
  const [transcript, setTranscript] = useState(initialTranscript);
  const [cleanup, setCleanup] = useState<CleanupMode>("off");
  const [status, setStatus] = useState<Status>(READY_STATUS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedSegment[]>([]);
  const [finalDuration, setFinalDuration] = useState<number | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const reportRef = useRef<RunReport | null>(null);
  const wavBlobRef = useRef<Blob | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  // Re-parse whenever the transcript or cleanup mode changes.
  const segments = useMemo(
    () => parseSubtitleBlocks(transcript),
    [transcript],
  );
  const summary = useMemo(() => summarizeTimeline(segments), [segments]);

  const cleanedSegments = useMemo(
    () =>
      segments.map((segment) => ({
        segment,
        cleanText: cleanSegmentText(segment.rawText, cleanup),
      })),
    [segments, cleanup],
  );

  const setAudio = useCallback((blob: Blob) => {
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    const url = URL.createObjectURL(blob);
    audioUrlRef.current = url;
    wavBlobRef.current = blob;
    setAudioUrl(url);
  }, []);

  const generate = useCallback(
    async (settings: GenerationSettings) => {
      if (!settings.apiKey || !settings.voiceId) {
        setStatus({
          kind: "error",
          message: "Add both the API key and voice ID before running.",
        });
        return;
      }
      if (!segments.length) {
        setStatus({
          kind: "error",
          message:
            "No valid segments found. Paste subtitle-style blocks and try again.",
        });
        return;
      }

      setIsGenerating(true);
      setGenerated([]);
      setFinalDuration(null);
      reportRef.current = null;

      const stitchItems: StitchItem[] = [];
      const generatedSegments: GeneratedSegment[] = [];
      let previousRequestIds: string[] = [];

      try {
        for (let i = 0; i < segments.length; i += 1) {
          const segment = segments[i];
          const text = cleanSegmentText(segment.rawText, cleanup);

          // A segment can become empty after filler cleanup — keep its slot as
          // silence so the timeline stays aligned.
          if (!text) {
            const duration = segment.targetDuration + segment.gapAfter;
            if (duration > 0) stitchItems.push({ type: "silence", duration });
            continue;
          }

          setStatus({
            kind: "info",
            message: `Generating segment ${i + 1} of ${segments.length}…`,
          });

          const data = await generateSpeech(text, settings, previousRequestIds);
          const buffer = await decodeBase64Audio(data.audio_base64);

          stitchItems.push({ type: "audio", buffer });
          if (segment.gapAfter > 0) {
            stitchItems.push({ type: "silence", duration: segment.gapAfter });
          }

          const requestId = data.request_id || data.history_item_id || null;
          if (requestId) previousRequestIds = [requestId];

          const row: GeneratedSegment = {
            index: segment.index,
            start: segment.start,
            end: segment.end,
            targetDuration: segment.targetDuration,
            generatedDuration: buffer.duration,
            gapAfter: segment.gapAfter,
            text,
            requestId,
            alignment: data.alignment,
          };
          generatedSegments.push(row);
          setGenerated((prev) => [...prev, row]);
        }

        const finalBuffer = await stitchTimeline(stitchItems);
        setAudio(audioBufferToWavBlob(finalBuffer));
        setFinalDuration(finalBuffer.duration);

        reportRef.current = {
          settings: {
            voiceId: settings.voiceId,
            modelId: settings.modelId,
            outputFormat: settings.outputFormat,
            stability: settings.stability,
            similarityBoost: settings.similarityBoost,
            speed: settings.speed,
          },
          cleanup,
          inputSegments: segments,
          generatedSegments,
          summary: {
            segmentCount: generatedSegments.length,
            originalDuration: summary.originalDuration,
            insertedSilence: summary.totalSilence,
            finalWavDuration: finalBuffer.duration,
          },
        };

        setStatus({
          kind: "success",
          message:
            "Done. Segment audio was generated, silence gaps were restored, and a stitched WAV was created.",
        });
      } catch (error) {
        setStatus({
          kind: "error",
          message: `Error: ${error instanceof Error ? error.message : String(error)}`,
        });
      } finally {
        setIsGenerating(false);
      }
    },
    [cleanup, segments, summary, setAudio],
  );

  const downloadReport = useCallback(() => {
    if (!reportRef.current) {
      setStatus({
        kind: "error",
        message: "Generate the stitched result first, then download the JSON.",
      });
      return;
    }
    const blob = new Blob([JSON.stringify(reportRef.current, null, 2)], {
      type: "application/json",
    });
    downloadBlob(blob, "elevenlabs-segment-stitch-report.json");
  }, []);

  const downloadWav = useCallback(() => {
    if (!wavBlobRef.current) {
      setStatus({
        kind: "error",
        message: "Generate the stitched result first, then download the WAV.",
      });
      return;
    }
    downloadBlob(wavBlobRef.current, "elevenlabs-stitched-output.wav");
  }, []);

  return {
    transcript,
    setTranscript,
    cleanup,
    setCleanup,
    status,
    isGenerating,
    segments,
    cleanedSegments,
    summary,
    generated,
    finalDuration,
    audioUrl,
    report: reportRef.current,
    hasResult: Boolean(wavBlobRef.current),
    generate,
    downloadReport,
    downloadWav,
  };
}
