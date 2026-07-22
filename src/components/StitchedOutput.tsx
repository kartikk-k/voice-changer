import type { GeneratedSegment, RunReport } from "@/lib/useStitcher";

import { Panel, PanelHeading } from "./Panel";
import { Chip } from "./ui";

function GeneratedRow({ row }: { row: GeneratedSegment }) {
  const drift = row.generatedDuration - row.targetDuration;
  return (
    <li className="flex gap-4 py-4 first:pt-0 last:pb-0">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-surface-2 text-xs font-semibold text-muted">
        {row.index + 1}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-muted">
            {row.start} → {row.end}
          </span>
          <Chip>target {row.targetDuration.toFixed(2)}s</Chip>
          <Chip>generated {row.generatedDuration.toFixed(2)}s</Chip>
          <span
            className={`text-xs font-medium ${drift > 0.05 || drift < -0.05 ? "text-warn" : "text-muted"}`}
          >
            {drift >= 0 ? "+" : ""}
            {drift.toFixed(2)}s
          </span>
        </div>
        <p className="mt-2 text-sm text-text">{row.text}</p>
      </div>
    </li>
  );
}

function ReportBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </p>
      <pre className="max-h-72 overflow-auto rounded-lg border border-border bg-surface-2 p-3 font-mono text-xs leading-relaxed text-text">
        {value || "—"}
      </pre>
    </div>
  );
}

/** Player, timeline/run reports, and per-segment result rows. */
export function StitchedOutput({
  audioUrl,
  generated,
  report,
}: {
  audioUrl: string | null;
  generated: GeneratedSegment[];
  report: RunReport | null;
}) {
  return (
    <Panel>
      <PanelHeading
        title="Stitched output"
        subtitle="Plays the browser-stitched WAV timeline, not one long ElevenLabs response."
      />

      <div className="grid gap-6 p-5">
        <audio
          controls
          src={audioUrl ?? undefined}
          className="w-full"
          aria-label="Stitched WAV output"
        />

        {generated.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              Segment results
            </p>
            <ol className="divide-y divide-border">
              {generated.map((row) => (
                <GeneratedRow key={row.index} row={row} />
              ))}
            </ol>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <ReportBlock
            label="Timeline summary"
            value={report ? JSON.stringify(report.summary, null, 2) : ""}
          />
          <ReportBlock
            label="Full run report"
            value={report ? JSON.stringify(report, null, 2) : ""}
          />
        </div>
      </div>
    </Panel>
  );
}
