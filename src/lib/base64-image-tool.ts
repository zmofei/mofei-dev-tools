export const IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
] as const;

export type ImageMimeType = (typeof IMAGE_MIME_TYPES)[number];

export type Base64ImageInput = {
  dataUrl: string;
  mimeType: string;
  base64: string;
};

const BASE64_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;
const DATA_URL_PATTERN = /^data:([^,]+),([\s\S]*)$/i;
const MIME_EXTENSION_MAP: Record<ImageMimeType, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'image/avif': 'avif',
};

export function isSupportedImageMimeType(value: string): value is ImageMimeType {
  return (IMAGE_MIME_TYPES as readonly string[]).includes(value);
}

export function stripBase64Whitespace(value: string) {
  return value.replace(/\s+/g, '');
}

export function isValidBase64Payload(value: string) {
  const compact = stripBase64Whitespace(value);
  return compact.length > 0 && compact.length % 4 === 0 && BASE64_PATTERN.test(compact);
}

function normalizeBase64Prefix(value: string, maxChars: number) {
  const compact = stripBase64Whitespace(value);
  const length = Math.min(compact.length, maxChars);
  return compact.slice(0, length - (length % 4));
}

function decodeBase64Bytes(value: string, maxChars?: number) {
  const compact = maxChars ? normalizeBase64Prefix(value, maxChars) : stripBase64Whitespace(value);

  if (typeof Buffer !== 'undefined') {
    return Uint8Array.from(Buffer.from(compact, 'base64'));
  }

  const binary = atob(compact);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function bytesToAscii(bytes: Uint8Array, start = 0, end = bytes.length) {
  return Array.from(bytes.slice(start, end), (byte) => String.fromCharCode(byte)).join('');
}

export function detectImageMimeTypeFromBase64(value: string): ImageMimeType | null {
  if (!isValidBase64Payload(value)) return null;

  const bytes = decodeBase64Bytes(value, 2048);
  if (bytes.length < 4) return null;

  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return 'image/png';
  }

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }

  if (bytesToAscii(bytes, 0, 6) === 'GIF87a' || bytesToAscii(bytes, 0, 6) === 'GIF89a') {
    return 'image/gif';
  }

  if (bytes.length >= 12 && bytesToAscii(bytes, 0, 4) === 'RIFF' && bytesToAscii(bytes, 8, 12) === 'WEBP') {
    return 'image/webp';
  }

  if (bytes.length >= 12 && bytesToAscii(bytes, 4, 8) === 'ftyp') {
    const brandText = bytesToAscii(bytes, 8, Math.min(bytes.length, 32));
    if (brandText.includes('avif') || brandText.includes('avis')) {
      return 'image/avif';
    }
  }

  const textPrefix = bytesToAscii(bytes, 0, Math.min(bytes.length, 512)).trimStart();
  if (textPrefix.startsWith('<svg') || (textPrefix.startsWith('<?xml') && textPrefix.includes('<svg'))) {
    return 'image/svg+xml';
  }

  return null;
}

export function parseBase64ImageInput(value: string, fallbackMimeType: ImageMimeType = 'image/png'): Base64ImageInput {
  const trimmed = value.trim();
  const dataUrlMatch = trimmed.match(DATA_URL_PATTERN);

  if (dataUrlMatch) {
    const mediaTypeParts = dataUrlMatch[1].split(';').map((part) => part.trim()).filter(Boolean);
    const declaredMimeType = (mediaTypeParts[0] || '').toLowerCase();
    const hasBase64Flag = mediaTypeParts.slice(1).some((part) => part.toLowerCase() === 'base64');
    const base64 = stripBase64Whitespace(dataUrlMatch[2]);
    const detectedMimeType = detectImageMimeTypeFromBase64(base64);
    const mimeType = detectedMimeType ?? declaredMimeType;

    if (!hasBase64Flag || !mimeType.startsWith('image/') || !isValidBase64Payload(base64)) {
      throw new Error('Invalid Base64 image data');
    }

    if (!detectedMimeType && !isSupportedImageMimeType(mimeType)) {
      throw new Error('Invalid Base64 image data');
    }

    return {
      dataUrl: `data:${mimeType};base64,${base64}`,
      mimeType,
      base64,
    };
  }

  const base64 = stripBase64Whitespace(trimmed);
  if (!isValidBase64Payload(base64)) {
    throw new Error('Invalid Base64 image data');
  }

  const detectedMimeType = detectImageMimeTypeFromBase64(base64);
  const mimeType = detectedMimeType ?? fallbackMimeType;

  return {
    dataUrl: `data:${mimeType};base64,${base64}`,
    mimeType,
    base64,
  };
}

export function extensionForImageMimeType(mimeType: string) {
  return isSupportedImageMimeType(mimeType) ? MIME_EXTENSION_MAP[mimeType] : 'img';
}

export function formatImageBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
