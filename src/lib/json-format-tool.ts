export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

export type JsonFormatResult =
  | {
      ok: true;
      value: JsonValue;
      formatted: string;
      minified: string;
      stats: JsonStats;
      parser: 'strict' | 'tolerant';
      normalized?: string;
      tolerantReasons?: JsonTolerantReason[];
    }
  | { ok: false; error: string; line?: number; column?: number };

export type JsonTolerantReason = 'comments' | 'unquotedKeys' | 'singleQuotedStrings' | 'trailingCommas';

export type JsonStats = {
  keys: number;
  arrays: number;
  objects: number;
  strings: number;
  numbers: number;
  booleans: number;
  nulls: number;
  maxDepth: number;
};

const EMPTY_STATS: JsonStats = {
  keys: 0,
  arrays: 0,
  objects: 0,
  strings: 0,
  numbers: 0,
  booleans: 0,
  nulls: 0,
  maxDepth: 0,
};

function parseJsonError(message: string) {
  const positionMatch = message.match(/position\s+(\d+)/i);
  const lineColumnMatch = message.match(/line\s+(\d+)\s+column\s+(\d+)/i);

  if (lineColumnMatch) {
    return {
      error: message,
      line: Number(lineColumnMatch[1]),
      column: Number(lineColumnMatch[2]),
    };
  }

  if (positionMatch) {
    return {
      error: message,
      column: Number(positionMatch[1]) + 1,
    };
  }

  return { error: message };
}

export function getJsonStats(value: JsonValue, depth = 0): JsonStats {
  const stats = { ...EMPTY_STATS, maxDepth: depth };

  if (value === null) {
    stats.nulls = 1;
    return stats;
  }

  if (Array.isArray(value)) {
    stats.arrays = 1;
    for (const item of value) {
      mergeStats(stats, getJsonStats(item, depth + 1));
    }
    return stats;
  }

  if (typeof value === 'object') {
    stats.objects = 1;
    const entries = Object.entries(value);
    stats.keys += entries.length;
    for (const [, item] of entries) {
      mergeStats(stats, getJsonStats(item, depth + 1));
    }
    return stats;
  }

  if (typeof value === 'string') stats.strings = 1;
  if (typeof value === 'number') stats.numbers = 1;
  if (typeof value === 'boolean') stats.booleans = 1;

  return stats;
}

function mergeStats(target: JsonStats, source: JsonStats) {
  target.keys += source.keys;
  target.arrays += source.arrays;
  target.objects += source.objects;
  target.strings += source.strings;
  target.numbers += source.numbers;
  target.booleans += source.booleans;
  target.nulls += source.nulls;
  target.maxDepth = Math.max(target.maxDepth, source.maxDepth);
}

function stripJsonLikeComments(input: string) {
  let output = '';
  let quote: '"' | "'" | null = null;
  let escaped = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];

    if (quote) {
      output += char;
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = null;
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      output += char;
      continue;
    }

    if (char === '/' && next === '/') {
      while (index < input.length && input[index] !== '\n') index += 1;
      output += '\n';
      continue;
    }

    if (char === '/' && next === '*') {
      index += 2;
      while (index < input.length && !(input[index] === '*' && input[index + 1] === '/')) index += 1;
      index += 1;
      continue;
    }

    output += char;
  }

  return output;
}

function convertSingleQuotedStrings(input: string) {
  let output = '';
  let inDouble = false;
  let inSingle = false;
  let escaped = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (inDouble) {
      output += char;
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') inDouble = false;
      continue;
    }

    if (inSingle) {
      if (escaped) {
        output += char === "'" ? "'" : `\\${char}`;
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === "'") {
        output += '"';
        inSingle = false;
      } else if (char === '"') {
        output += '\\"';
      } else {
        output += char;
      }
      continue;
    }

    if (char === '"') {
      inDouble = true;
      output += char;
      continue;
    }

    if (char === "'") {
      inSingle = true;
      output += '"';
      continue;
    }

    output += char;
  }

  return output;
}

function quoteUnquotedKeys(input: string) {
  let output = '';
  let quote: '"' | "'" | null = null;
  let escaped = false;
  let expectingKey = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (quote) {
      output += char;
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = null;
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      output += char;
      continue;
    }

    if (char === '{' || char === ',') {
      expectingKey = true;
      output += char;
      continue;
    }

    if (expectingKey) {
      if (/\s/.test(char)) {
        output += char;
        continue;
      }

      if (char === '}') {
        expectingKey = false;
        output += char;
        continue;
      }

      if (/[A-Za-z_$]/.test(char)) {
        let key = char;
        let cursor = index + 1;
        while (cursor < input.length && /[\w$-]/.test(input[cursor])) {
          key += input[cursor];
          cursor += 1;
        }

        let lookahead = cursor;
        while (lookahead < input.length && /\s/.test(input[lookahead])) lookahead += 1;

        if (input[lookahead] === ':') {
          output += `"${key}"`;
          index = cursor - 1;
          expectingKey = false;
          continue;
        }
      }

      expectingKey = false;
    }

    output += char;
  }

  return output;
}

function removeTrailingCommas(input: string) {
  let output = '';
  let quote: '"' | "'" | null = null;
  let escaped = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (quote) {
      output += char;
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = null;
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      output += char;
      continue;
    }

    if (char === ',') {
      let lookahead = index + 1;
      while (lookahead < input.length && /\s/.test(input[lookahead])) lookahead += 1;
      if (input[lookahead] === '}' || input[lookahead] === ']') continue;
    }

    output += char;
  }

  return output;
}

export function normalizeJsonLike(input: string) {
  return normalizeJsonLikeWithReasons(input).normalized;
}

export function normalizeJsonLikeWithReasons(input: string) {
  const reasons: JsonTolerantReason[] = [];

  const withoutComments = stripJsonLikeComments(input);
  if (withoutComments !== input) reasons.push('comments');

  const withQuotedKeys = quoteUnquotedKeys(withoutComments);
  if (withQuotedKeys !== withoutComments) reasons.push('unquotedKeys');

  const withDoubleQuotedStrings = convertSingleQuotedStrings(withQuotedKeys);
  if (withDoubleQuotedStrings !== withQuotedKeys) reasons.push('singleQuotedStrings');

  const normalized = removeTrailingCommas(withDoubleQuotedStrings);
  if (normalized !== withDoubleQuotedStrings) reasons.push('trailingCommas');

  return { normalized, reasons };
}

export function formatJson(input: string, indent = 2): JsonFormatResult {
  try {
    const value = JSON.parse(input) as JsonValue;
    return {
      ok: true,
      value,
      formatted: JSON.stringify(value, null, indent),
      minified: JSON.stringify(value),
      stats: getJsonStats(value),
      parser: 'strict',
    };
  } catch (error) {
    const strictError = parseJsonError(error instanceof Error ? error.message : 'Invalid JSON');
    const { normalized, reasons } = normalizeJsonLikeWithReasons(input);

    if (normalized !== input) {
      try {
        const value = JSON.parse(normalized) as JsonValue;
        return {
          ok: true,
          value,
          formatted: JSON.stringify(value, null, indent),
          minified: JSON.stringify(value),
          stats: getJsonStats(value),
          parser: 'tolerant',
          normalized,
          tolerantReasons: reasons,
        };
      } catch {
        // Return the strict JSON error; it points at the user's original input.
      }
    }

    return {
      ok: false,
      ...strictError,
    };
  }
}

export function jsonPathForChild(parentPath: string, key: string | number) {
  if (typeof key === 'number') return `${parentPath}[${key}]`;
  return /^[A-Za-z_$][\w$]*$/.test(key) ? `${parentPath}.${key}` : `${parentPath}[${JSON.stringify(key)}]`;
}
