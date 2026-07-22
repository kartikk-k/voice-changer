/** Slim top navigation bar with the waveform logo and app name. */
export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1280px] items-center gap-3 px-6 py-3">
        <div
          aria-hidden
          className="grid size-8 place-items-center rounded-lg bg-primary text-inverse"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-[18px]"
          >
            <path d="M3 14c2.2 0 2.8-4 5-4s2.8 4 5 4 2.8-4 5-4 2.8 4 3 4" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-display text-sm font-semibold leading-tight">
            Segment Stitcher
          </span>
          <span className="text-xs text-muted">ElevenLabs timeline TTS</span>
        </div>
      </div>
    </header>
  );
}
