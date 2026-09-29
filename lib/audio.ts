export const MAX_AUDIO_BYTES = 10 * 1024 * 1024;
export const AUDIO_ACCEPT = '.mp3,.m4a,.wav,.ogg,.webm,audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/webm';
// Inspect container signatures rather than trusting the filename or submitted MIME type.
export function audioContentType(bytes: Uint8Array): string | null {
  const tag = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  if (bytes.length < 12) return null;
  if (tag(0,4) === 'RIFF' && tag(8,12) === 'WAVE') return 'audio/wav';
  if (tag(0,4) === 'OggS') return 'audio/ogg';
  if (tag(0,3) === 'ID3' || (bytes[0] === 255 && (bytes[1] & 224) === 224 && (bytes[1] & 6) !== 0 && (bytes[1] & 24) !== 8)) return 'audio/mpeg';
  if (tag(4,8) === 'ftyp' && ['M4A ','M4B ','isom','iso2','mp41','mp42'].includes(tag(8,12))) return 'audio/mp4';
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3 && tag(0,Math.min(bytes.length,256)).includes('webm')) return 'audio/webm';
  return null;
}
