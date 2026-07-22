"use client";

export function SegmentCard({
  speaker,
  start,
  end,
  text,
  meta,
  edited,
}: {
  speaker: string;
  start: string;
  end: string;
  text: string;
  meta: string;
  edited?: boolean;
}) {
  return (
    <div className="flex flex-col gap-[14px] rounded-[16px] border border-[rgba(0,0,0,0.1)] bg-white p-[12px]">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[8px]">
          <span className="text-xs text-black">{speaker || "Speaker"}</span>
          <span className="text-[12px] opacity-60">
            {start} &rarr; {end}
          </span>
          {edited && (
            <span className="rounded-[4px] bg-[#f7f7f7] px-[6px] py-[2px] text-[10px] opacity-50">
              edited
            </span>
          )}
        </div>
        <span className="text-[12px] opacity-50">{meta}</span>
      </div>
      {/* Text */}
      <p className="text-[15px] opacity-60">{text}</p>
    </div>
  );
}
