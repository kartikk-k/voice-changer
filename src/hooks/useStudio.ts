"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { processWithAi, type AiAction } from "@/lib/ai-gateway";
import {
  audioBufferToWavBlob,
  decodeBase64Audio,
  downloadBlob,
  stitchTimeline,
  type StitchItem,
} from "@/lib/audio";
import { generateSpeech } from "@/lib/elevenlabs";
import { SAMPLE_TRANSCRIPT } from "@/lib/sampleTranscript";
import {
  cleanSegmentText,
  parseSubtitleBlocks,
  summarizeTimeline,
  type Segment,
} from "@/lib/subtitles";
import type { AppSettings, GeneratedSegment, MainTab } from "@/lib/studio/types";

/**
 * Owns the transcript → AI → audio pipeline: parsing input into segments,
 * running AI grammar/cleanup, and generating + stitching ElevenLabs audio.
 *
 * Settings are passed in (see {@link useSettings}); `onNavigate` lets the
 * pipeline advance the active tab as steps complete.
 */
export function useStudio(
  settings: AppSettings,
  onNavigate: (tab: MainTab) => void,
) {
  // Input
  const [rawInput, setRawInput] = useState(SAMPLE_TRANSCRIPT);

  // Transcript
  const [segments, setSegments] = useState<Segment[]>([]);
  const [editedTexts, setEditedTexts] = useState<Record<number, string>>({});
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [aiStatus, setAiStatus] = useState("");

  // Audio
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateStatus, setGenerateStatus] = useState("");
  const [generatedSegments, setGeneratedSegments] = useState<
    GeneratedSegment[]
  >([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [finalDuration, setFinalDuration] = useState<number | null>(null);
  const wavBlobRef = useRef<Blob | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const summary = useMemo(() => summarizeTimeline(segments), [segments]);

  /** Text for a segment: an explicit edit, else cleaned/raw per settings. */
  const getSegmentText = useCallback(
    (seg: Segment) => {
      if (editedTexts[seg.index] !== undefined) return editedTexts[seg.index];
      return settings.cleanupEnabled
        ? cleanSegmentText(seg.rawText, "light")
        : seg.rawText;
    },
    [editedTexts, settings.cleanupEnabled],
  );

  const editSegmentText = useCallback((idx: number, text: string) => {
    setEditedTexts((prev) => ({ ...prev, [idx]: text }));
  }, []);

  const generateTranscript = useCallback(() => {
    const parsed = parseSubtitleBlocks(rawInput);
    if (!parsed.length) {
      setGenerateStatus("No valid segments found. Paste subtitle-style blocks.");
      return;
    }
    setSegments(parsed);
    setEditedTexts({});
    onNavigate("transcript");
    setGenerateStatus("");
  }, [rawInput, onNavigate]);

  const uploadFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => setRawInput(reader.result as string);
      reader.readAsText(file);
    },
    [],
  );

  const processAi = useCallback(
    async (action: AiAction) => {
      if (!settings.vercelGatewayKey) {
        setAiStatus("Add Vercel AI Gateway key in Credentials tab first.");
        return;
      }
      if (!segments.length) {
        setAiStatus("No segments to process.");
        return;
      }

      setIsProcessingAi(true);
      setAiStatus(`Running ${action}...`);

      try {
        const allText = segments
          .map((seg) => `[${seg.index}] ${getSegmentText(seg)}`)
          .join("\n");

        const result = await processWithAi({
          text: allText,
          action,
          model: settings.aiModel,
          apiKey: settings.vercelGatewayKey,
          grammarInstructions: settings.grammarInstructions,
          cleanupInstructions: settings.cleanupInstructions,
          rephraseInstructions: settings.aggressiveRephraseInstructions,
        });

        const lines = result.split("\n").filter((l) => l.trim());
        const newTexts: Record<number, string> = {};
        for (const line of lines) {
          const match = line.match(/^\[(\d+)\]\s*(.*)/);
          if (match) newTexts[Number(match[1])] = match[2].trim();
        }

        if (Object.keys(newTexts).length > 0) {
          setEditedTexts((prev) => ({ ...prev, ...newTexts }));
        } else {
          setAiStatus("AI processing complete. Check results.");
        }

        setAiStatus(`${action} complete.`);
      } catch (err) {
        setAiStatus(
          `Error: ${err instanceof Error ? err.message : String(err)}`,
        );
      } finally {
        setIsProcessingAi(false);
      }
    },
    [settings, segments, getSegmentText],
  );

  const generateAudio = useCallback(async () => {
    if (!settings.elevenLabsApiKey || !settings.voiceId) {
      setGenerateStatus("Add API key and Voice ID in settings first.");
      return;
    }
    if (!segments.length) {
      setGenerateStatus("No segments. Generate transcript first.");
      return;
    }

    setIsGenerating(true);
    setGeneratedSegments([]);
    setFinalDuration(null);

    const stitchItems: StitchItem[] = [];
    const results: GeneratedSegment[] = [];
    let previousRequestIds: string[] = [];

    try {
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const text = getSegmentText(seg);

        if (!text.trim()) {
          const dur = seg.targetDuration + seg.gapAfter;
          if (dur > 0) stitchItems.push({ type: "silence", duration: dur });
          continue;
        }

        setGenerateStatus(
          `Generating segment ${i + 1} of ${segments.length}...`,
        );

        const data = await generateSpeech(
          text,
          {
            apiKey: settings.elevenLabsApiKey,
            voiceId: settings.voiceId,
            modelId: "eleven_multilingual_v2",
            outputFormat: settings.outputFormat,
            stability: settings.stability,
            similarityBoost: settings.similarityBoost,
            speed: settings.speed,
          },
          previousRequestIds,
        );

        const buffer = await decodeBase64Audio(data.audio_base64);
        stitchItems.push({ type: "audio", buffer });
        if (seg.gapAfter > 0) {
          stitchItems.push({ type: "silence", duration: seg.gapAfter });
        }

        const requestId = data.request_id || data.history_item_id || null;
        if (requestId) previousRequestIds = [requestId];

        const row: GeneratedSegment = {
          index: seg.index,
          start: seg.start,
          end: seg.end,
          speaker: seg.speaker,
          targetDuration: seg.targetDuration,
          generatedDuration: buffer.duration,
          gapAfter: seg.gapAfter,
          text,
          requestId,
          alignment: data.alignment,
        };
        results.push(row);
        setGeneratedSegments([...results]);
      }

      const finalBuffer = await stitchTimeline(stitchItems);
      const blob = audioBufferToWavBlob(finalBuffer);

      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;
      wavBlobRef.current = blob;
      setAudioUrl(url);
      setFinalDuration(finalBuffer.duration);
      setGenerateStatus("Done. Audio generated and stitched.");
      onNavigate("audio");
    } catch (err) {
      setGenerateStatus(
        `Error: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setIsGenerating(false);
    }
  }, [settings, segments, getSegmentText, onNavigate]);

  const downloadWav = useCallback(() => {
    if (wavBlobRef.current) {
      downloadBlob(wavBlobRef.current, "voix-studio-output.wav");
    }
  }, []);

  return {
    // input
    rawInput,
    setRawInput,
    uploadFile,
    generateTranscript,
    // transcript
    segments,
    editedTexts,
    getSegmentText,
    editSegmentText,
    summary,
    processAi,
    isProcessingAi,
    aiStatus,
    // audio
    generateAudio,
    isGenerating,
    generateStatus,
    generatedSegments,
    audioUrl,
    finalDuration,
    downloadWav,
  };
}
