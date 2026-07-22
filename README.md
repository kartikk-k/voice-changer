# VOIX.STUDIO

Open-source voice generation studio. Convert transcripts to speech with ElevenLabs, apply AI-powered grammar and cleanup, and stitch timeline-matched audio — all in the browser.

## What it does

1. **Input** — Paste an SRT-style transcript or upload an audio file (auto-transcribed via ElevenLabs Speech-to-Text)
2. **Transcript** — View parsed segments with speaker labels, timestamps, and gaps. Run AI-powered grammar correction and filler cleanup (powered by Vercel AI Gateway)
3. **Audio** — Generate speech per segment using ElevenLabs TTS, stitch them with silence gaps to match the original timeline, and download the result

## Features

- SRT transcript parsing with speaker labels and timestamp gaps
- Audio file upload with automatic speech-to-text transcription
- AI grammar correction and transcript cleanup (removes "uh", "um", `[lip smack]`, stutters, etc.)
- Parallel TTS generation (3 concurrent requests)
- Timeline-accurate audio stitching — final duration matches original
- Searchable voice selector with audio preview
- Custom audio player with speed control
- Light / Dark / System theme
- All settings persisted in localStorage
- Fully responsive

## Tech stack

- [Next.js 16](https://nextjs.org/) + [React 19](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [ElevenLabs API](https://elevenlabs.io/) — TTS and Speech-to-Text
- [Vercel AI SDK](https://sdk.vercel.ai/) — AI gateway for grammar/cleanup
- TypeScript

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Required API keys

Configure these in the Settings panel:

| Key | Where to get it | Used for |
|-----|----------------|----------|
| ElevenLabs API Key | [elevenlabs.io/app/settings/api-keys](https://elevenlabs.io/app/settings/api-keys) | Voice generation and audio transcription |
| Vercel AI Gateway Key | Your AI gateway provider | Grammar correction and transcript cleanup |

## Project structure

```
src/
├── app/
│   ├── api/ai/route.ts      # Server-side AI proxy (Vercel AI Gateway)
│   ├── globals.css           # Theme tokens (light/dark)
│   ├── layout.tsx
│   └── page.tsx              # Main page layout
├── components/
│   ├── common/               # MetricsBar, SegmentCard
│   ├── settings/             # CredentialsPanel, VoicePanel, RephrasePanel, SettingsPanel
│   ├── tabs/                 # InputTab, TranscriptTab, AudioTab
│   └── ui.tsx                # Design system primitives
├── hooks/
│   ├── useSettings.ts        # localStorage-persisted settings
│   ├── useStudio.ts          # Core pipeline (input → transcript → audio)
│   └── useTheme.ts           # Light/dark/system theme
└── lib/
    ├── ai-gateway.ts         # AI client
    ├── audio.ts              # Web Audio stitching and WAV encoding
    ├── elevenlabs.ts         # ElevenLabs TTS client
    ├── sampleTranscript.ts   # Demo transcript
    ├── subtitles.ts          # SRT parser
    └── studio/
        ├── constants.ts      # Defaults, tab definitions, model list
        ├── format.ts         # Duration formatting
        └── types.ts          # Shared TypeScript types
```

## License

MIT
