"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { processWithAi } from "@/lib/ai-gateway";
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
  parseSubtitleBlocks,
  summarizeTimeline,
  type Segment,
} from "@/lib/subtitles";
import type { AppSettings, GeneratedSegment, MainTab } from "@/lib/studio/types";

interface STTWord {
  text: string;
  type: string;
  speaker_id?: string;
  start?: number;
  end?: number;
}

interface WordSegment {
  start: number;
  end: number;
  speaker: string;
  words: string[];
}

/** Core studio hook managing input, transcription, AI editing, TTS generation, and stitching. */
export function useStudio(
  settings: AppSettings,
  onNavigate: (tab: MainTab) => void,
) {
  // Input
  const [rawInput, setRawInput] = useState(SAMPLE_TRANSCRIPT);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

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

  /** Text for a segment: returns edited text if available, otherwise raw text. */
  const getSegmentText = useCallback(
    (seg: Segment) => {
      if (editedTexts[seg.index] !== undefined) return editedTexts[seg.index];
      return seg.rawText;
    },
    [editedTexts],
  );

  const selectFile = useCallback((file: File) => {
    setUploadedFile(file);
    setRawInput(""); // Clear raw input when file is selected
  }, []);

  const removeFile = useCallback(() => {
    setUploadedFile(null);
  }, []);

  /**
   * Transcribe an audio file using ElevenLabs Speech-to-Text API.
   * Returns the transcript as SRT-formatted text.
   */
  const transcribeAudioFile = useCallback(
    async (file: File): Promise<string> => {
      if (!settings.elevenLabsApiKey) {
        throw new Error("Add ElevenLabs API key in Credentials settings first.");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("model_id", "scribe_v1");
      formData.append("timestamps_granularity", "word");

      const response = await fetch(
        "https://api.elevenlabs.io/v1/speech-to-text",
        {
          method: "POST",
          headers: { "xi-api-key": settings.elevenLabsApiKey },
          body: formData,
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const msg =
          (data as { detail?: { message?: string } | string }).detail
            ? typeof (data as { detail: string | { message?: string } }).detail === "string"
              ? (data as { detail: string }).detail
              : ((data as { detail: { message?: string } }).detail as { message?: string })?.message
            : `Transcription failed (${response.status})`;
        throw new Error(msg || `Transcription failed (${response.status})`);
      }

      const data = await response.json();

      // Filter to only actual spoken words (skip punctuation/spacing tokens
      // which lack timestamps and speaker_id, causing false segment splits)
      const allTokens: STTWord[] = data.words || [];
      const spokenWords = allTokens.filter(
        (w) => w.type === "word" && w.start !== undefined && w.end !== undefined,
      );

      if (!spokenWords.length) {
        throw new Error("No words found in transcription result.");
      }

      // Group spoken words into segments by speaker changes or pauses (>1.5s)
      const srtLines: string[] = [];

      const formatTime = (s: number) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = Math.floor(s % 60);
        const ms = Math.round((s % 1) * 1000);
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
      };

      // Build segments
      const segments: WordSegment[] = [];
      let current: WordSegment = {
        start: spokenWords[0].start!,
        end: spokenWords[0].end!,
        speaker: spokenWords[0].speaker_id || "Speaker 0",
        words: [spokenWords[0].text],
      };

      for (let i = 1; i < spokenWords.length; i++) {
        const w = spokenWords[i];
        const gap = w.start! - current.end;
        const speakerChanged =
          w.speaker_id !== undefined &&
          w.speaker_id !== current.speaker;

        if (gap > 1.5 || speakerChanged) {
          segments.push(current);
          current = {
            start: w.start!,
            end: w.end!,
            speaker: w.speaker_id || current.speaker,
            words: [w.text],
          };
        } else {
          current.words.push(w.text);
          current.end = w.end!;
        }
      }
      segments.push(current);

      // Also weave in punctuation from the original token stream
      // by using the top-level `text` field which has proper punctuation
      // For now, join words with spaces (punctuation is already attached to words in most cases)
      for (const seg of segments) {
        const speaker = seg.speaker ? ` [${seg.speaker}]` : "";
        srtLines.push(
          `${formatTime(seg.start)} --> ${formatTime(seg.end)}${speaker}`,
        );
        srtLines.push(seg.words.join(" "));
        srtLines.push("");
      }

      return srtLines.join("\n");
    },
    [settings.elevenLabsApiKey],
  );

  const generateTranscript = useCallback(async () => {
    if (uploadedFile) {
      // Audio file mode: transcribe first
      const isAudio = uploadedFile.type.startsWith("audio/");
      if (isAudio) {
        setIsTranscribing(true);
        setGenerateStatus("Transcribing audio file...");
        try {
          const srtText = await transcribeAudioFile(uploadedFile);
          const parsed = parseSubtitleBlocks(srtText);
          if (!parsed.length) {
            setGenerateStatus("Transcription produced no valid segments.");
            return;
          }
          setRawInput(srtText);
          setSegments(parsed);
          setEditedTexts({});
          onNavigate("transcript");
          setGenerateStatus("");
        } catch (err) {
          setGenerateStatus(
            `Error: ${err instanceof Error ? err.message : String(err)}`,
          );
        } finally {
          setIsTranscribing(false);
        }
      } else {
        // Text file (SRT/VTT/TXT): read as text
        const text = await uploadedFile.text();
        const parsed = parseSubtitleBlocks(text);
        if (!parsed.length) {
          setGenerateStatus("No valid segments found in file.");
          return;
        }
        setRawInput(text);
        setSegments(parsed);
        setEditedTexts({});
        onNavigate("transcript");
        setGenerateStatus("");
      }
    } else {
      // Raw input mode
      const parsed = parseSubtitleBlocks(rawInput);
      if (!parsed.length) {
        setGenerateStatus("No valid segments found. Paste subtitle-style blocks.");
        return;
      }
      setSegments(parsed);
      setEditedTexts({});
      onNavigate("transcript");
      setGenerateStatus("");
    }
  }, [rawInput, uploadedFile, onNavigate, transcribeAudioFile]);

  /**
   * Run "Fix Grammar & Cleanup" — sends all segments to the AI agent with
   * the user's grammar and cleanup settings. The AI returns edited text
   * per segment. Segments that become empty will be treated as silence
   * during audio generation.
   */
  const fixGrammarAndCleanup = useCallback(async () => {
    if (!settings.vercelGatewayKey) {
      setAiStatus("Add Vercel AI Gateway key in Credentials tab first.");
      return;
    }
    if (!segments.length) {
      setAiStatus("No segments to process.");
      return;
    }
    if (!settings.grammarEnabled && !settings.cleanupEnabled) {
      setAiStatus("Enable at least Grammar or Clean up in Rephrase & Grammar settings.");
      return;
    }

    setIsProcessingAi(true);
    setAiStatus("Running grammar & cleanup...");

    try {
      const allText = segments
        .map(
          (seg) =>
            `[${seg.index} | duration: ${seg.targetDuration.toFixed(1)}s | gap_after: ${seg.gapAfter.toFixed(1)}s] ${getSegmentText(seg)}`,
        )
        .join("\n");

      const result = await processWithAi({
        text: allText,
        model: settings.aiModel,
        apiKey: settings.vercelGatewayKey,
        grammarEnabled: settings.grammarEnabled,
        grammarInstructions: settings.grammarInstructions,
        cleanupEnabled: settings.cleanupEnabled,
        cleanupInstructions: settings.cleanupInstructions,
      });

      // Parse the AI result back into per-segment texts
      const lines = result.split("\n").filter((l) => l.trim());
      const newTexts: Record<number, string> = {};
      for (const line of lines) {
        const match = line.match(/^\[(\d+)\]\s*(.*)/);
        if (match) newTexts[Number(match[1])] = match[2].trim();
      }

      if (Object.keys(newTexts).length > 0) {
        setEditedTexts((prev) => ({ ...prev, ...newTexts }));
        setAiStatus("Grammar & cleanup complete.");
      } else {
        setAiStatus("AI processing complete but could not parse results.");
      }
    } catch (err) {
      setAiStatus(
        `Error: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setIsProcessingAi(false);
    }
  }, [settings, segments, getSegmentText]);

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

    const CONCURRENCY = 20;

    try {
      // Prepare work items: figure out which segments need TTS vs silence
      interface WorkItem {
        segIndex: number;
        seg: Segment;
        text: string;
      }
      const workItems: (WorkItem | null)[] = segments.map((seg) => {
        const text = getSegmentText(seg);
        if (!text.trim()) return null; // silence
        return { segIndex: seg.index, seg, text };
      });

      const speechSettings = {
        apiKey: settings.elevenLabsApiKey,
        voiceId: settings.voiceId,
        modelId: "eleven_multilingual_v2",
        outputFormat: settings.outputFormat,
        stability: settings.stability,
        similarityBoost: settings.similarityBoost,
        speed: settings.speed,
      };

      // Results array indexed by segment position to preserve order
      const resultsByIndex: (GeneratedSegment | null)[] = new Array(
        segments.length,
      ).fill(null);
      const buffersByIndex: (AudioBuffer | null)[] = new Array(
        segments.length,
      ).fill(null);
      // Generate TTS for non-empty segments in parallel batches of CONCURRENCY
      const ttsItems = workItems
        .map((item, i) => (item ? { ...item, position: i } : null))
        .filter((x): x is WorkItem & { position: number } => x !== null);

      for (let batch = 0; batch < ttsItems.length; batch += CONCURRENCY) {
        const chunk = ttsItems.slice(batch, batch + CONCURRENCY);

        setGenerateStatus(
          `Generating segments ${batch + 1}–${Math.min(batch + CONCURRENCY, ttsItems.length)} of ${ttsItems.length}...`,
        );

        const promises = chunk.map(async (item) => {
          const data = await generateSpeech(item.text, speechSettings);
          const buffer = await decodeBase64Audio(data.audio_base64);
          const requestId = data.request_id || data.history_item_id || null;

          const row: GeneratedSegment = {
            index: item.seg.index,
            start: item.seg.start,
            end: item.seg.end,
            speaker: item.seg.speaker,
            targetDuration: item.seg.targetDuration,
            generatedDuration: buffer.duration,
            gapAfter: item.seg.gapAfter,
            text: item.text,
            requestId,
            alignment: data.alignment,
          };

          resultsByIndex[item.position] = row;
          buffersByIndex[item.position] = buffer;

          // Update progress
          setGeneratedSegments(
            resultsByIndex.filter((r): r is GeneratedSegment => r !== null),
          );
        });

        await Promise.all(promises);
      }

      // Stitch in original segment order
      const stitchItems: StitchItem[] = [];
      for (let i = 0; i < segments.length; i++) {
        const buf = buffersByIndex[i];
        if (buf) {
          stitchItems.push({ type: "audio", buffer: buf });
        } else {
          // Blank/empty segment → silence for its full duration
          const dur = segments[i].targetDuration + segments[i].gapAfter;
          if (dur > 0) stitchItems.push({ type: "silence", duration: dur });
          continue;
        }
        if (segments[i].gapAfter > 0) {
          stitchItems.push({ type: "silence", duration: segments[i].gapAfter });
        }
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
    rawInput,
    setRawInput,
    uploadedFile,
    selectFile,
    removeFile,
    isTranscribing,
    generateTranscript,
    segments,
    editedTexts,
    getSegmentText,
    summary,
    fixGrammarAndCleanup,
    isProcessingAi,
    aiStatus,
    generateAudio,
    isGenerating,
    generateStatus,
    generatedSegments,
    audioUrl,
    finalDuration,
    downloadWav,
  };
}
