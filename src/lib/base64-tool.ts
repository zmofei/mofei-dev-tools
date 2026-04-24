export type Base64Mode = 'encode' | 'decode';

export function encodeBase64Text(value: string) {
  return Buffer.from(value, 'utf8').toString('base64');
}

export function decodeBase64Text(value: string) {
  const compact = value.replace(/\s+/g, '');

  if (!compact || compact.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(compact)) {
    throw new Error('Invalid Base64 string');
  }

  const decoded = Buffer.from(compact, 'base64').toString('utf8');
  if (encodeBase64Text(decoded).replace(/=+$/, '') !== compact.replace(/=+$/, '')) {
    throw new Error('Invalid Base64 string');
  }

  return decoded;
}

export function convertBase64Text(value: string, mode: Base64Mode) {
  if (!value.trim()) {
    return { result: '', error: '' };
  }

  try {
    return {
      result: mode === 'encode' ? encodeBase64Text(value) : decodeBase64Text(value),
      error: '',
    };
  } catch {
    return { result: '', error: 'Invalid Base64 string' };
  }
}

export function looksLikeBase64(value: string) {
  const compact = value.trim().replace(/\s+/g, '');
  if (compact.length < 8 || compact.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(compact)) {
    return false;
  }

  try {
    return encodeBase64Text(decodeBase64Text(compact)).replace(/=+$/, '') === compact.replace(/=+$/, '');
  } catch {
    return false;
  }
}
