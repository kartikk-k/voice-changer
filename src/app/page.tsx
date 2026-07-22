"use client";

import { useState } from "react";

import { Header } from "@/components/Header";
import { Panel, PanelHeading } from "@/components/Panel";
import { SegmentPreview } from "@/components/SegmentPreview";
import { SettingsForm, type FormState } from "@/components/SettingsForm";
import { StitchedOutput } from "@/components/StitchedOutput";
import { TimelineMetrics } from "@/components/TimelineMetrics";
import { Button, Field, StatusBanner, Textarea } from "@/components/ui";
import { SAMPLE_TRANSCRIPT } from "@/lib/sampleTranscript";
import { useStitcher } from "@/lib/useStitcher";

const INITIAL_FORM: FormState = {
  apiKey: "",
  voiceId: "",
  modelId: "eleven_multilingual_v2",
  outputFormat: "wav_44100",
  stability: 0.35,
  similarityBoost: 0.75,
  speed: 1,
};

export default function Home() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const stitcher = useStitcher(SAMPLE_TRANSCRIPT);

  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="min-h-dvh">
      <Header />

      <main className="mx-auto grid max-w-[1280px] gap-6 px-6 py-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
        {/* Settings sidebar */}
        <Panel className="lg:sticky lg:top-20">
          <PanelHeading title="Settings" subtitle="Voice and generation options" />
          <div className="p-5">
            <SettingsForm
              form={form}
              onFormChange={updateForm}
              cleanup={stitcher.cleanup}
              onCleanupChange={stitcher.setCleanup}
            />
          </div>
        </Panel>

        {/* Main content */}
        <div className="grid gap-6">
          <Panel>
            <PanelHeading
              title="Transcript"
              subtitle="One request per timing block; gaps become inserted silence."
            />
            <div className="grid gap-4 p-5">
              <Field label="Subtitle-like input" htmlFor="subtitleInput">
                <Textarea
                  id="subtitleInput"
                  value={stitcher.transcript}
                  onChange={(e) => stitcher.setTranscript(e.target.value)}
                />
              </Field>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="primary"
                  onClick={() => stitcher.generate(form)}
                  disabled={stitcher.isGenerating}
                >
                  {stitcher.isGenerating
                    ? "Generating…"
                    : "Generate & stitch"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={stitcher.downloadWav}
                  disabled={!stitcher.hasResult}
                >
                  Download WAV
                </Button>
                <Button
                  variant="ghost"
                  onClick={stitcher.downloadReport}
                  disabled={!stitcher.hasResult}
                >
                  Download JSON
                </Button>
              </div>

              <StatusBanner status={stitcher.status} />
            </div>
          </Panel>

          <Panel>
            <TimelineMetrics
              segmentCount={stitcher.segments.length}
              originalDuration={stitcher.summary.originalDuration}
              silenceDuration={stitcher.summary.totalSilence}
              finalDuration={stitcher.finalDuration}
            />
          </Panel>

          <Panel>
            <PanelHeading
              title="Timeline preview"
              subtitle="Original segments, cleaned text, and silence gaps."
            />
            <div className="p-5">
              <SegmentPreview segments={stitcher.cleanedSegments} />
            </div>
          </Panel>

          <StitchedOutput
            audioUrl={stitcher.audioUrl}
            generated={stitcher.generated}
            report={stitcher.report}
          />
        </div>
      </main>
    </div>
  );
}
