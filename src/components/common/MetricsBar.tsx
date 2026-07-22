"use client";

import { MetricCell } from "@/components/ui";

export function MetricsBar({
  metrics,
}: {
  metrics: { label: string; value: string }[];
}) {
  return (
    <div className="flex rounded-[16px] bg-[#f7f7f7] px-[24px]">
      {metrics.map((m) => (
        <MetricCell key={m.label} label={m.label} value={m.value} />
      ))}
    </div>
  );
}
