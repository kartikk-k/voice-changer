function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-4">
      <span className="block text-xs text-muted">{label}</span>
      <strong className="mt-1 block font-display text-xl font-semibold tabular-nums">
        {value}
      </strong>
    </div>
  );
}

/** Four headline numbers describing the timeline, shown as a divided strip. */
export function TimelineMetrics({
  segmentCount,
  originalDuration,
  silenceDuration,
  finalDuration,
}: {
  segmentCount: number;
  originalDuration: number;
  silenceDuration: number;
  finalDuration: number | null;
}) {
  const seconds = (value: number) => `${value.toFixed(2)}s`;

  return (
    <div className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">
      <Metric label="Segments" value={String(segmentCount)} />
      <Metric label="Original duration" value={seconds(originalDuration)} />
      <Metric label="Silence inserted" value={seconds(silenceDuration)} />
      <Metric
        label="Final WAV duration"
        value={finalDuration === null ? "—" : seconds(finalDuration)}
      />
    </div>
  );
}
