"use client";

import { useMemo, useState } from 'react';
import { GlassPanel, TextButton } from '@mofei-dev/ui';
import Foot from '@/components/Common/Foot';
import { ToolContentSection, ToolHero, ToolPageShell } from '@/components/Common/ToolLayout';
import ResizableTextarea from '@/components/Common/ResizableTextarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatJson, jsonPathForChild, type JsonTolerantReason, type JsonValue } from '@/lib/json-format-tool';

const SAMPLE_JSON = `{
  "name": "Mofei Dev Tools",
  "version": 1,
  "features": ["format", "validate", "inspect"],
  "meta": {
    "private": true,
    "location": "Helsinki"
  }
}`;

type Copy = {
  title: string;
  subtitle: string;
  back: string;
  input: string;
  output: string;
  viewer: string;
  format: string;
  minify: string;
  loadSample: string;
  clear: string;
  copy: string;
  copied: string;
  expand: string;
  collapse: string;
  invalid: string;
  tolerant: string;
  tolerantReasons: Record<JsonTolerantReason, string>;
  placeholder: string;
  extractTool: string;
};

const COPY: Record<'en' | 'zh', Copy> = {
  en: {
    title: 'JSON Formatter & Viewer',
    subtitle: 'Format, minify, validate, and inspect JSON in a collapsible tree view. Everything runs locally in your browser.',
    back: 'Back to tools',
    input: 'JSON input',
    output: 'Formatted output',
    viewer: 'Tree viewer',
    format: 'Format',
    minify: 'Minify',
    loadSample: 'Load sample',
    clear: 'Clear',
    copy: 'Copy',
    copied: 'Copied',
    expand: 'Expand all',
    collapse: 'Collapse all',
    invalid: 'Invalid JSON',
    tolerant: 'This input is not strict JSON. It was parsed in tolerant mode and converted to valid JSON output.',
    tolerantReasons: {
      comments: 'comments are not allowed in strict JSON',
      unquotedKeys: 'property names must use double quotes',
      singleQuotedStrings: 'strings must use double quotes',
      trailingCommas: 'trailing commas are not allowed',
    },
    placeholder: 'Paste JSON here...',
    extractTool: 'Need JSONPath extraction? Open JSON Path Extractor',
  },
  zh: {
    title: 'JSON 格式化与查看',
    subtitle: '格式化、压缩、校验 JSON，并用可折叠树形视图快速查看结构。所有处理都在浏览器本地完成。',
    back: '返回工具合集',
    input: 'JSON 输入',
    output: '格式化结果',
    viewer: '树形查看',
    format: '格式化',
    minify: '压缩',
    loadSample: '加载示例',
    clear: '清空',
    copy: '复制',
    copied: '已复制',
    expand: '展开全部',
    collapse: '折叠全部',
    invalid: 'JSON 无效',
    tolerant: '当前输入不是严格 JSON，已按宽松模式解析并转换为合法 JSON 输出。',
    tolerantReasons: {
      comments: '严格 JSON 不允许注释',
      unquotedKeys: '属性名必须使用双引号',
      singleQuotedStrings: '字符串必须使用双引号',
      trailingCommas: '严格 JSON 不允许尾逗号',
    },
    placeholder: '在左侧粘贴 JSON...',
    extractTool: '需要提取 JSON 路径？打开 JSON 路径提取工具',
  },
};

function valueType(value: JsonValue) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function scalarClass(value: JsonValue) {
  switch (valueType(value)) {
    case 'string':
      return 'text-emerald-200';
    case 'number':
      return 'text-cyan-200';
    case 'boolean':
      return 'text-violet-200';
    case 'null':
      return 'text-white/38';
    default:
      return 'text-white/76';
  }
}

function JsonScalar({ value }: { value: JsonValue }) {
  return <span className={scalarClass(value)}>{JSON.stringify(value)}</span>;
}

function JsonTree({
  value,
  path = '$',
  depth = 0,
  collapsed,
  setCollapsed,
}: {
  value: JsonValue;
  path?: string;
  depth?: number;
  collapsed: Set<string>;
  setCollapsed: (next: Set<string>) => void;
}) {
  const type = valueType(value);
  const isBranch = type === 'array' || type === 'object';
  const isCollapsed = collapsed.has(path);

  if (!isBranch) {
    return <JsonScalar value={value} />;
  }

  const entries = Array.isArray(value)
    ? value.map((item, index) => [index, item] as const)
    : Object.entries(value as Record<string, JsonValue>);
  const openToken = Array.isArray(value) ? '[' : '{';
  const closeToken = Array.isArray(value) ? ']' : '}';

  const toggle = () => {
    const next = new Set(collapsed);
    if (isCollapsed) next.delete(path);
    else next.add(path);
    setCollapsed(next);
  };

  return (
    <span>
      <button
        type="button"
        onClick={toggle}
        className="mr-1 inline-flex h-5 w-5 items-center justify-center rounded border border-white/[0.08] bg-white/[0.035] text-[10px] text-white/62 hover:bg-white/[0.07] hover:text-white"
        aria-label={isCollapsed ? 'Expand JSON node' : 'Collapse JSON node'}
      >
        {isCollapsed ? '+' : '-'}
      </button>
      <span className="text-white/72">{openToken}</span>
      <span className="ml-1 text-white/34">{entries.length}</span>
      {isCollapsed ? (
        <span className="text-white/72"> ... {closeToken}</span>
      ) : (
        <>
          <div className="ml-4 border-l border-white/[0.08] pl-3">
            {entries.map(([key, child], index) => {
              const childPath = jsonPathForChild(path, key);
              return (
                <div key={childPath} className="leading-7" style={{ paddingLeft: depth > 0 ? 2 : 0 }}>
                  <span className="mr-2 text-white/38">{Array.isArray(value) ? key : JSON.stringify(key)}</span>
                  <span className="mr-2 text-white/28">:</span>
                  <JsonTree value={child as JsonValue} path={childPath} depth={depth + 1} collapsed={collapsed} setCollapsed={setCollapsed} />
                  {index < entries.length - 1 ? <span className="text-white/38">,</span> : null}
                </div>
              );
            })}
          </div>
          <span className="text-white/72">{closeToken}</span>
        </>
      )}
    </span>
  );
}

function collectBranchPaths(value: JsonValue, path = '$', paths: string[] = []) {
  if (value && typeof value === 'object') {
    paths.push(path);
    const entries = Array.isArray(value)
      ? value.map((item, index) => [index, item] as const)
      : Object.entries(value as Record<string, JsonValue>);
    for (const [key, child] of entries) {
      collectBranchPaths(child as JsonValue, jsonPathForChild(path, key), paths);
    }
  }
  return paths;
}

export default function JsonFormatPage() {
  const { language } = useLanguage();
  const lang = language === 'zh' ? 'zh' : 'en';
  const copy = COPY[lang];
  const [input, setInput] = useState(SAMPLE_JSON);
  const [indent, setIndent] = useState(2);
  const [viewMode, setViewMode] = useState<'format' | 'minify'>('format');
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const result = useMemo(() => formatJson(input, indent), [input, indent]);
  const output = result.ok ? (viewMode === 'format' ? result.formatted : result.minified) : '';

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const collapseAll = () => {
    if (result.ok) setCollapsed(new Set(collectBranchPaths(result.value)));
  };

  return (
    <ToolPageShell>
      <ToolHero
        backHref={lang === 'zh' ? '/zh' : '/'}
        backLabel={copy.back}
        title={copy.title}
        subtitle={copy.subtitle}
        infoSections={[
          {
            title: lang === 'zh' ? '什么是 JSON 格式化？' : 'What is JSON formatting?',
            body: lang === 'zh'
              ? 'JSON 格式化会把压缩或混乱的 JSON 重新排版成可读结构，也能校验语法、压缩输出，并用树形视图检查层级。'
              : 'JSON formatting turns minified or messy JSON into a readable structure, validates syntax, minifies output, and helps inspect nested data in a tree view.',
          },
          {
            title: lang === 'zh' ? '如何使用这个工具？' : 'How to use this tool',
            body: lang === 'zh'
              ? '在输入框粘贴 JSON，工具会自动格式化、校验并生成树形视图。非严格 JSON 会用宽松模式解析，并提示原因。'
              : 'Paste JSON into the input. The tool formats, validates, and builds a tree view automatically. Non-strict JSON is parsed in tolerant mode with reasons shown.',
          },
        ]}
        relatedTools={[
          {
            href: lang === 'zh' ? '/zh/json-extract' : '/json-extract',
            label: copy.extractTool,
          },
        ]}
      />
        <ToolContentSection className="md:pb-10">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <GlassPanel className="transform-none p-4 hover:translate-y-0 md:p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-white/84">{copy.input}</h2>
                <div className="flex items-center gap-2">
                  <TextButton onClick={() => setInput(SAMPLE_JSON)}>{copy.loadSample}</TextButton>
                  <TextButton onClick={() => setInput('')}>{copy.clear}</TextButton>
                </div>
              </div>
              <ResizableTextarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={copy.placeholder}
                autoHeight
                initialHeight={420}
                minHeight={260}
                maxHeight={900}
                textareaClassName="text-white/84"
              />
              {!result.ok && input.trim() ? (
                <p className="mt-3 rounded-xl border border-rose-300/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-100">
                  {copy.invalid}: {result.error}
                </p>
              ) : null}
              {result.ok && result.parser === 'tolerant' ? (
                <div className="mt-3 rounded-xl border border-amber-200/20 bg-amber-300/10 px-3 py-2 text-sm text-amber-50">
                  <p>{copy.tolerant}</p>
                  {result.tolerantReasons?.length ? (
                    <ul className="mt-1 list-disc space-y-0.5 pl-5 text-amber-50/82">
                      {result.tolerantReasons.map((reason) => (
                        <li key={reason}>{copy.tolerantReasons[reason]}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}
            </GlassPanel>

            <div className="space-y-5">
              <GlassPanel className="transform-none p-4 hover:translate-y-0 md:p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-white/84">{copy.viewer}</h2>
                    {result.ok ? (
                      <p className="mt-1 text-xs text-white/42">
                        {result.stats.objects} objects · {result.stats.arrays} arrays · {result.stats.keys} keys · depth {result.stats.maxDepth}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <TextButton onClick={() => setCollapsed(new Set())}>{copy.expand}</TextButton>
                    <TextButton onClick={collapseAll}>{copy.collapse}</TextButton>
                  </div>
                </div>
                <div className="max-h-[430px] overflow-auto rounded-2xl border border-white/[0.08] bg-slate-950/42 p-4 font-mono text-sm">
                  {result.ok ? (
                    <JsonTree value={result.value} collapsed={collapsed} setCollapsed={setCollapsed} />
                  ) : (
                    <span className="text-white/38">{copy.placeholder}</span>
                  )}
                </div>
              </GlassPanel>

              <GlassPanel className="transform-none p-4 hover:translate-y-0 md:p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold text-white/84">{copy.output}</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={indent}
                      onChange={(event) => setIndent(Number(event.target.value))}
                      className="h-8 rounded-full border border-white/[0.10] bg-white/[0.055] px-3 text-xs text-white outline-none"
                    >
                      <option value={2}>2 spaces</option>
                      <option value={4}>4 spaces</option>
                    </select>
                    <button type="button" onClick={() => setViewMode('format')} className={`h-8 rounded-full px-3 text-xs font-medium ${viewMode === 'format' ? 'bg-white text-slate-950' : 'border border-white/[0.10] text-white/72'}`}>
                      {copy.format}
                    </button>
                    <button type="button" onClick={() => setViewMode('minify')} className={`h-8 rounded-full px-3 text-xs font-medium ${viewMode === 'minify' ? 'bg-white text-slate-950' : 'border border-white/[0.10] text-white/72'}`}>
                      {copy.minify}
                    </button>
                    <button type="button" onClick={copyOutput} className="h-8 rounded-full border border-white/[0.10] bg-white/[0.055] px-3 text-xs font-medium text-white/76 hover:bg-white/[0.08] hover:text-white">
                      {copied ? copy.copied : copy.copy}
                    </button>
                  </div>
                </div>
                <pre className="max-h-[360px] overflow-auto rounded-2xl border border-white/[0.08] bg-slate-950/52 p-4 font-mono text-sm leading-6 text-white/78">
                  {output || ' '}
                </pre>
              </GlassPanel>
            </div>
          </div>
        </ToolContentSection>
      <footer>
        <Foot />
      </footer>
    </ToolPageShell>
  );
}
