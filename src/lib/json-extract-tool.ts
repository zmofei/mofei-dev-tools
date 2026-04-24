export type JsonExtractColumn = {
  id: string;
  name: string;
  path: string;
};

const DEFAULT_COLUMN: JsonExtractColumn = { id: '1', name: 'Column 1', path: '$.properties.title' };
const MAX_AUTO_COLUMNS = 8;

export function createColumnNameFromPath(path: string, index: number) {
  const segment = path.replace(/\[\*\]/g, '').split('.').filter(Boolean).pop();
  if (!segment || segment === '$') return `Column ${index + 1}`;

  return segment.replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function createAutoColumns(paths: string[]) {
  const leafPaths = paths.filter((path) => !path.endsWith('[*]'));
  const selectedPaths = (leafPaths.length > 0 ? leafPaths : paths).slice(0, MAX_AUTO_COLUMNS);
  if (selectedPaths.length === 0) return [DEFAULT_COLUMN];

  return selectedPaths.map((path, index) => ({
    id: String(index + 1),
    name: createColumnNameFromPath(path, index),
    path,
  }));
}

function parsePath(path: string) {
  return path
    .replace(/^\$\./, '')
    .replace(/^\$/, '')
    .split('.')
    .filter(Boolean);
}

export function getJsonPathValue(value: unknown, path: string): unknown {
  if (path === '$') return value;

  let current = value;
  for (const segment of parsePath(path)) {
    if (segment.endsWith('[*]')) {
      const key = segment.slice(0, -3);
      const arrayValue = key ? (current as Record<string, unknown>)?.[key] : current;
      if (!Array.isArray(arrayValue)) return undefined;
      return arrayValue;
    }

    if (Array.isArray(current)) {
      const index = Number(segment);
      current = Number.isInteger(index) ? current[index] : undefined;
    } else {
      current = (current as Record<string, unknown>)?.[segment];
    }

    if (current === undefined || current === null) return current;
  }

  return current;
}

export function extractJsonRows(json: unknown, columns: JsonExtractColumn[]) {
  const rows = Array.isArray(json) ? json : [json];
  return rows.map((item) => {
    const row: Record<string, unknown> = {};
    for (const column of columns) {
      row[column.name] = getJsonPathValue(item, column.path);
    }
    return row;
  });
}

export function generateSuggestedJsonPaths(value: unknown, maxDepth = 4) {
  const suggestions: string[] = [];

  function visit(item: unknown, basePath: string, depth: number) {
    if (depth <= 0 || item === null || typeof item !== 'object') return;

    if (Array.isArray(item)) {
      suggestions.push(`${basePath}[*]`);
      if (item.length > 0) visit(item[0], `${basePath}[*]`, depth - 1);
      return;
    }

    for (const [key, child] of Object.entries(item)) {
      const childPath = basePath === '$' ? `$.${key}` : `${basePath}.${key}`;
      suggestions.push(childPath);
      visit(child, childPath, depth - 1);
    }
  }

  visit(value, '$', maxDepth);
  return [...new Set(suggestions)];
}
