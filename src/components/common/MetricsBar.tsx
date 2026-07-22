"use client";

import { MetricCell } from "@/components/ui";

/** Horizontal bar displaying a row of metric value/label pairs. */
export function MetricsBar({
  metrics,
}: {
  metrics: { label: string; value: string }[];
}) {
  return (
    <div className="flex rounded-[16px] bg-surface-alt px-[24px]">
      {metrics.map((m) => (
        <MetricCell key={m.label} label={m.label} value={m.value} />
      ))}
    </div>
  );
}
