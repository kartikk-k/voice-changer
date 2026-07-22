"use client";

import { useRef } from "react";

import { PillButton } from "@/components/ui";

export function InputTab({
  rawInput,
  onRawInputChange,
  uploadedFile,
  onFileSelect,
  onFileRemove,
  onGenerate,
  status,
  isTranscribing,
}: {
  rawInput: string;
  onRawInputChange: (value: string) => void;
  uploadedFile: File | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  onGenerate: () => void;
  status: string;
  isTranscribing: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    // Reset so the same file can be re-selected
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex flex-col gap-[8px]">
      {uploadedFile ? (
        /* ─── Uploaded file state ─── */
        <div className="flex h-[130px] w-full items-center justify-center rounded-[16px] bg-[#f7f7f7] px-[24px] relative">
          <div className="flex flex-col items-center gap-[4px]">
            <p className="text-[16px] text-black">{uploadedFile.name}</p>
            <p className="text-[14px] text-[#808080]">
              {(uploadedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          {/* Remove button */}
          <button
            type="button"
            onClick={onFileRemove}
            className="absolute right-[16px] top-[16px] flex size-[24px] items-center justify-center rounded-full bg-[rgba(0,0,0,0.08)] text-[rgba(0,0,0,0.5)] transition-colors hover:bg-[rgba(0,0,0,0.15)]"
            aria-label="Remove file"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ) : (
        /* ─── Upload + raw input state ─── */
        <>
          {/* Upload area */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="flex h-[130px] w-full flex-col items-center justify-center rounded-[16px] bg-[#f7f7f7] px-[24px] transition-colors hover:bg-[#efefef]"
          >
            <p className="text-[16px] text-black">Upload audio file</p>
            <p className="text-[14px] text-[#808080]">
              Click to upload or Drag and drop here
            </p>
          </button>

          {/* Paste raw input */}
          <div className="rounded-[14px] border border-[rgba(0,0,0,0.1)]">
            <div className="px-[12px] py-[6px]">
              <span className="text-[12px] text-black">Paste raw input here</span>
            </div>
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
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.srt,.txt,.vtt"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Status */}
      {status && (
        <p className="text-xs text-[#808080]">{status}</p>
      )}

      {/* Generate button */}
      <div className="flex justify-end pt-[14px]">
        <div className="w-auto">
          <PillButton onClick={onGenerate} disabled={isTranscribing}>
            {isTranscribing ? "Transcribing..." : "Generate transcript"}
          </PillButton>
        </div>
      </div>
    </div>
  );
}
