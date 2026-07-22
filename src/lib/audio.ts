/**
 * Browser audio helpers: decode ElevenLabs responses, synthesise silence,
 * stitch buffers along a timeline, and encode the result as a WAV blob.
 *
 * Everything here depends on the Web Audio API, so it only runs in the browser.
 */

/** An audio clip or a stretch of silence to be stitched into the timeline. */
export type StitchItem =
  | { type: "audio"; buffer: AudioBuffer }
  | { type: "silence"; duration: number };

let sharedContext: AudioContext | null = null;

/** Lazily create (and resume) a single shared AudioContext. */
export async function getAudioContext(): Promise<AudioContext> {
  if (!sharedContext) {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    sharedContext = new Ctx();
  }
  if (sharedContext.state === "suspended") {
    await sharedContext.resume();
  }
  return sharedContext;
}

/** Decode a base64-encoded audio payload into an {@link AudioBuffer}. */
export async function decodeBase64Audio(base64: string): Promise<AudioBuffer> {
  const ctx = await getAudioContext();
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  // `slice(0)` hands decodeAudioData its own detachable ArrayBuffer.
  return ctx.decodeAudioData(bytes.buffer.slice(0));
}

/**
 * Concatenate audio clips and silence into a single timeline-matched buffer.
 * Sample rate and channel count are taken from the first audio clip (falling
 * back to 44.1kHz mono when the timeline is silence-only).
 */
export async function stitchTimeline(items: StitchItem[]): Promise<AudioBuffer> {
  const ctx = await getAudioContext();

  const firstAudio = items.find(
    (item): item is Extract<StitchItem, { type: "audio" }> =>
      item.type === "audio",
  )?.buffer;
  const sampleRate = firstAudio?.sampleRate ?? 44100;
  const channels = firstAudio?.numberOfChannels ?? 1;

  const buffers = items.map((item) => {
    if (item.type === "audio") return item.buffer;
    const frameCount = Math.max(1, Math.round(item.duration * sampleRate));
    return ctx.createBuffer(channels, frameCount, sampleRate);
  });

  const totalLength = buffers.reduce((sum, buffer) => sum + buffer.length, 0);
  const output = ctx.createBuffer(channels, totalLength, sampleRate);

  let offset = 0;
  for (const buffer of buffers) {
    for (let ch = 0; ch < channels; ch += 1) {
      const source = buffer.getChannelData(
        Math.min(ch, buffer.numberOfChannels - 1),
      );
      output.getChannelData(ch).set(source, offset);
    }
    offset += buffer.length;
  }

  return output;
}

/** Encode an {@link AudioBuffer} as a 16-bit PCM WAV blob. */
export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const { sampleRate, length: samples } = buffer;
  const bitDepth = 16;
  const blockAlign = (numChannels * bitDepth) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples * blockAlign;

  const wav = new ArrayBuffer(44 + dataSize);
  const view = new DataView(wav);
  let offset = 0;

  const writeString = (str: string) => {
    for (let i = 0; i < str.length; i += 1) view.setUint8(offset++, str.charCodeAt(i));
  };
  const writeUint32 = (value: number) => {
    view.setUint32(offset, value, true);
    offset += 4;
  };
  const writeUint16 = (value: number) => {
    view.setUint16(offset, value, true);
    offset += 2;
  };

  writeString("RIFF");
  writeUint32(36 + dataSize);
  writeString("WAVE");
  writeString("fmt ");
  writeUint32(16); // PCM header size
  writeUint16(1); // audio format: PCM
  writeUint16(numChannels);
  writeUint32(sampleRate);
  writeUint32(byteRate);
  writeUint16(blockAlign);
  writeUint16(bitDepth);
  writeString("data");
  writeUint32(dataSize);

  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch += 1) {
    channels.push(buffer.getChannelData(ch));
  }

  for (let i = 0; i < samples; i += 1) {
    for (let ch = 0; ch < numChannels; ch += 1) {
      const clamped = Math.max(-1, Math.min(1, channels[ch][i] || 0));
      const sample = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
      view.setInt16(offset, sample, true);
      offset += 2;
    }
  }

  return new Blob([wav], { type: "audio/wav" });
}

/** Trigger a browser download for a blob. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
