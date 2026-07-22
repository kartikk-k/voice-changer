"use client";

import { useRef } from "react";

import { PillButton } from "@/components/ui";

export function InputTab({
  rawInput,
  onRawInputChange,
  onFileUpload,
  onGenerate,
  status,
}: {
  rawInput: string;
  onRawInputChange: (value: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerate: () => void;
  status: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-[8px]">
      {/* Upload area */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex h-[130px] w-full flex-col items-center justify-center rounded-[16px] bg-[#f7f7f7] px-[24px] transition-colors hover:bg-[#efefef]"
      >
        <p className="text-sm text-black">Upload audio file</p>
        <p className="text-xs text-[#808080]">
          Click to upload or Drag and drop here
        </p>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".srt,.txt,.vtt"
        onChange={onFileUpload}
        className="hidden"
      />

      {/* Paste label */}
      <div className="rounded-[14px] border border-[rgba(0,0,0,0.1)]">
        <div className="px-[12px] py-[6px]">
          <span className="text-[12px] text-black">Paste raw input here</span>
        </div>
        {/* Text area */}
        <div className="p-[12px] pt-0">
          <div className="rounded-[8px] p-[8px]">
            <textarea
              spellCheck={false}
              placeholder="Paste raw input here..."
              value={rawInput}
              onChange={(e) => onRawInputChange(e.target.value)}
              className="h-[268px] w-full resize-none bg-transparent text-[15px] text-black outline-none placeholder:opacity-60"
            />
          </div>
        </div>
      </div>

      {/* Status */}
      {status && (
        <p className="text-xs text-[#808080]">{status}</p>
      )}

      {/* Generate button */}
      <div className="flex justify-end pt-[14px]">
        <div className="w-auto">
          <PillButton onClick={onGenerate}>Generate transcript</PillButton>
        </div>
      </div>
    </div>
  );
}
