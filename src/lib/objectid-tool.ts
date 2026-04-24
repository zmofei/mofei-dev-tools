const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

export function isValidObjectId(value: string) {
  return OBJECT_ID_PATTERN.test(value);
}

export function generateObjectId(
  timestampMs = Date.now(),
  randomHex = '0000000000',
  counterHex = '000000',
) {
  if (!/^[0-9a-fA-F]{10}$/.test(randomHex)) {
    throw new Error('randomHex must be 10 hexadecimal characters');
  }

  if (!/^[0-9a-fA-F]{6}$/.test(counterHex)) {
    throw new Error('counterHex must be 6 hexadecimal characters');
  }

  const timestampHex = Math.floor(timestampMs / 1000).toString(16).padStart(8, '0');
  return `${timestampHex}${randomHex}${counterHex}`.toLowerCase();
}

export function extractObjectIdTimestamp(objectId: string) {
  if (!isValidObjectId(objectId)) {
    return null;
  }

  return parseInt(objectId.slice(0, 8), 16) * 1000;
}

export function analyzeObjectId(objectId: string) {
  if (!isValidObjectId(objectId)) {
    return null;
  }

  return {
    timestampHex: objectId.slice(0, 8).toLowerCase(),
    randomHex: objectId.slice(8, 18).toLowerCase(),
    counterHex: objectId.slice(18, 24).toLowerCase(),
    timestamp: extractObjectIdTimestamp(objectId),
  };
}
