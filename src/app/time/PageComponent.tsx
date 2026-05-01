"use client";

import { useEffect, useMemo, useState } from 'react';
import { GlassPanel } from '@mofei-dev/ui';
import Foot from '@/components/Common/Foot';
import { ToolContentSection, ToolHero, ToolPageShell } from '@/components/Common/ToolLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { event } from '@/components/GoogleAnalytics';
import {
  DEFAULT_WORK_RANGE_COLOR,
  DEFAULT_TIME_PLACES,
  HOME_PLACE_ID,
  TIMEZONE_PLACES,
  WORK_RANGE_COLORS,
  buildDateFromLocalInput,
  createCustomPlaceFromTimeZone,
  customTimeZoneId,
  dateRelation,
  encodeShareState,
  findPlaceById,
  formatDateLabel,
  formatTime,
  getMatchingWorkRange,
  getSupportedTimeZones,
  getTimeParts,
  hexToRgba,
  matchPlaceInput,
  matchTimeZoneInput,
  normalizePlaceIds,
  normalizeWorkRange,
  placeInputLabel,
  parseShareState,
  timeZoneOption,
  workRangeLabel,
  type WorkRange,
  type TimezonePlace,
} from '@/lib/timezone-tool';
import { homePath, toolPath } from '@/lib/site';

type Copy = {
  title: string;
  subtitle: string;
  back: string;
  addPlaceholder: string;
  add: string;
  addTimeZone: string;
  chooseTimeZone: string;
  noMatch: string;
  remove: string;
  editName: string;
  share: string;
  shared: string;
  board: string;
  workday: string;
  workHours: string;
  workStart: string;
  workEnd: string;
  addWorkRange: string;
  wakeUp: string;
  bedtime: string;
  compareTip: string;
  faqTitle: string;
  faqItems: Array<{
    question: string;
    answer: string;
  }>;
};

const COPY: Record<'en' | 'zh', Copy> = {
  en: {
    title: 'World Time Compare',
    subtitle: 'Compare live local time, date differences, and working-hour overlap across cities, then convert cross-time-zone meeting times into your own local time.',
    back: 'Back to tools',
    addPlaceholder: 'Search city, country, or IANA zone',
    add: 'Add',
    addTimeZone: 'Add time zone',
    chooseTimeZone: 'Choose a time zone',
    noMatch: 'No match in the quick list. Choose an exact IANA time zone instead.',
    remove: 'Remove',
    editName: 'Edit name',
    share: 'Share setup',
    shared: 'Link copied',
    board: 'Live time comparison',
    workday: 'Work',
    workHours: 'Work hours',
    workStart: 'Start',
    workEnd: 'End',
    addWorkRange: 'Add time range',
    wakeUp: 'Wake',
    bedtime: 'Sleep',
    compareTip: 'The left axis uses the first row as the reference day. Each column shows that location’s matching local hour.',
    faqTitle: 'Common timezone questions',
    faqItems: [
      {
        question: 'How do I compare time across different time zones?',
        answer: 'Add the cities or IANA time zones you want to compare. The timeline shows each location’s matching local hour side by side, including date changes like +1 or -1 day.',
      },
      {
        question: 'How can I find a good meeting time across time zones?',
        answer: 'Add every participant’s city, then scan for hours where the work-hour bands overlap. Pick a row where all or most locations are inside normal working hours.',
      },
      {
        question: 'How do I know if a coworker is currently in working hours?',
        answer: 'Add your coworker’s city and check the current-time marker against the work-hour band. You can adjust the work range if their team uses different hours.',
      },
      {
        question: 'How do I convert a city’s time to my local time?',
        answer: 'Add your city as the first reference column and add the target city. Select or read the target city’s hour in the timeline to see the matching local hour in your column.',
      },
      {
        question: 'Does the converter handle daylight saving time?',
        answer: 'Yes. The tool uses IANA time zones through the browser’s time zone data, so DST-aware cities are converted using the correct offset for the selected date.',
      },
      {
        question: 'Can I share a timezone comparison with others?',
        answer: 'Yes. Use Share setup to copy a link with the selected cities and time so others can open the same comparison.',
      },
    ],
  },
  zh: {
    title: '世界时间对照',
    subtitle: '实时对比不同城市的当地时间、日期差异和工作时间重叠，也能把跨时区会议时间直接换算成你的当地时间。',
    back: '返回工具合集',
    addPlaceholder: '搜索城市、国家或 IANA 时区',
    add: '添加',
    addTimeZone: '添加时区',
    chooseTimeZone: '选择时区',
    noMatch: '快捷列表里没有匹配项，请选择一个准确的 IANA 时区。',
    remove: '移除',
    editName: '编辑名称',
    share: '分享配置',
    shared: '链接已复制',
    board: '实时世界时间对照',
    workday: '工作',
    workHours: '工作时间',
    workStart: '开始',
    workEnd: '结束',
    addWorkRange: '添加时间段',
    wakeUp: '起床',
    bedtime: '睡觉',
    compareTip: '左侧时间轴以第一行为基准日期，每一列显示该地点对应的本地小时。',
    faqTitle: '常见时区问题',
    faqItems: [
      {
        question: '怎么比较不同时区的时间？',
        answer: '添加要比较的城市或 IANA 时区，时间轴会把每个地点对应的当地小时并排显示，并标出跨日期的 +1 或 -1。',
      },
      {
        question: '怎么找跨时区会议时间？',
        answer: '把参会人的城市都添加进来，然后查看哪些时间行同时落在大家的工作时间色块内，优先选择重叠最多的时间。',
      },
      {
        question: '怎么知道同事现在是不是工作时间？',
        answer: '添加同事所在城市，看当前时间指示线是否落在该城市的工作时间范围内。如果对方团队作息不同，可以手动调整工作时间。',
      },
      {
        question: '怎么把某个城市时间换算成本地时间？',
        answer: '把本地城市放在第一列，再添加目标城市。查看目标城市某个小时所在的同一行，就能看到对应的本地时间。',
      },
      {
        question: '这个时区换算会处理夏令时吗？',
        answer: '会。工具使用 IANA 时区和浏览器时区数据，会根据所选日期自动应用对应城市的夏令时偏移。',
      },
      {
        question: '可以把跨时区对照结果发给别人吗？',
        answer: '可以。点击“分享配置”会复制包含城市和时间状态的链接，对方打开后能看到同一组时区对照。',
      },
    ],
  },
};

const TIMELINE_AXIS_WIDTH = 72;
const TIMELINE_COLUMN_WIDTH = 148;
const TIMELINE_HEADER_HEIGHT = 72;
const TIMELINE_POINTER_LABEL_HEIGHT = 26;
const TIMELINE_ROW_HEIGHT = 32;
const TIMELINE_HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const STICKY_SURFACE = 'bg-[rgba(21,33,65,0.94)] backdrop-blur-xl';
const WAKE_HOUR = 7;
const BEDTIME_HOUR = 23;
const STORAGE_KEY = 'mofei_timezone_board';
const TIMEZONE_SEARCH_DELAY = 180;
const TOOL_USAGE_CATEGORY = 'Tool Usage';

type TimezoneEventParams = Record<string, string | number | boolean | null | undefined>;

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function toDateInputValue(date: Date, timeZone: string) {
  const parts = getTimeParts(date, timeZone);
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
}

function useClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return now;
}

function getPlaceLabel(place: TimezonePlace, customLabels: Record<string, string> = {}) {
  return customLabels[place.id]?.trim() || place.name;
}

function timePositionRatio(date: Date, timeZone: string) {
  const parts = getTimeParts(date, timeZone);
  return (parts.hour + parts.minute / 60) / 24;
}

function routineMarker(hour: number, copy: Copy): { label: string; icon: 'sun' | 'moon'; className: string } | null {
  if (hour === WAKE_HOUR) return { label: copy.wakeUp, icon: 'sun', className: 'text-amber-200 drop-shadow-[0_0_5px_rgba(253,230,138,0.65)]' };
  if (hour === BEDTIME_HOUR) return { label: copy.bedtime, icon: 'moon', className: 'bg-slate-950/45 text-indigo-100/75' };
  return null;
}

function RoutineIcon({ icon }: { icon: 'sun' | 'moon' }) {
  if (icon === 'sun') {
    return (
      <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="3.4" fill="currentColor" stroke="none" />
        <path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="size-3" fill="currentColor" aria-hidden="true">
      <path d="M20.1 15.4A8.6 8.6 0 0 1 8.6 3.9a.7.7 0 0 0-.7-1A9.7 9.7 0 1 0 21.1 16.1a.7.7 0 0 0-1-.7Z" />
    </svg>
  );
}

function MiniClock({ hour, minute }: { hour: number; minute: number }) {
  const hourAngle = ((hour % 12) + minute / 60) * 30;
  const minuteAngle = minute * 6;
  const isDaytime = hour >= WAKE_HOUR && hour < BEDTIME_HOUR;

  return (
    <span
      className={cx(
        'relative inline-flex size-10 shrink-0 items-center justify-center rounded-full border opacity-65',
        isDaytime ? 'border-amber-100/35 bg-amber-100/35 text-amber-50' : 'border-indigo-200/16 bg-slate-950/30 text-indigo-100',
      )}
      aria-hidden="true"
    >
      <span className={cx('absolute size-1.5 rounded-full', isDaytime ? 'bg-amber-50/90' : 'bg-white/80')} />
      <span
        className={cx('absolute left-1/2 top-1/2 h-[9px] w-[2px] origin-bottom rounded-full', isDaytime ? 'bg-amber-50/90' : 'bg-white/82')}
        style={{ transform: `translate(-50%, -100%) rotate(${hourAngle}deg)` }}
      />
      <span
        className={cx('absolute left-1/2 top-1/2 h-[14px] w-px origin-bottom rounded-full', isDaytime ? 'bg-cyan-100/90' : 'bg-cyan-100/82')}
        style={{ transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)` }}
      />
    </span>
  );
}

function selectedHourKey(date: Date, timeZone: string) {
  const parts = getTimeParts(date, timeZone);
  return `${toDateInputValue(date, timeZone)}-${parts.hour}`;
}

function selectedCellKey(date: Date, timeZone: string) {
  const parts = getTimeParts(date, timeZone);
  return `${toDateInputValue(date, timeZone)}-${parts.hour}-${parts.minute}`;
}

export default function TimezonePage() {
  const { language } = useLanguage();
  const lang = language === 'zh' ? 'zh' : 'en';
  const copy = COPY[lang];
  const now = useClock();
  const [placeIds, setPlaceIds] = useState<string[]>(() => normalizePlaceIds(DEFAULT_TIME_PLACES));
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [query, setQuery] = useState('');
  const [manualTimeZone, setManualTimeZone] = useState('UTC');
  const [shareState, setShareState] = useState<'idle' | 'copied'>('idle');
  const [workRanges, setWorkRanges] = useState<WorkRange[]>([{ start: 9, end: 17, color: DEFAULT_WORK_RANGE_COLOR }]);
  const [showWorkHours, setShowWorkHours] = useState(false);
  const [draggedPlaceId, setDraggedPlaceId] = useState<string | null>(null);
  const [dragTargetPlaceId, setDragTargetPlaceId] = useState<string | null>(null);
  const [placeLabels, setPlaceLabels] = useState<Record<string, string>>({});
  const [editingPlaceId, setEditingPlaceId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const trackTimezone = (action: string, params: TimezoneEventParams = {}) => {
    event(`timezone_${action}`, TOOL_USAGE_CATEGORY, {
      language: lang,
      zone_count: placeIds.length,
      work_range_count: workRanges.length,
      ...params,
    });
  };

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchQuery(query), TIMEZONE_SEARCH_DELAY);
    return () => window.clearTimeout(timer);
  }, [query]);

  const places = useMemo(() => placeIds.map(findPlaceById).filter(Boolean) as TimezonePlace[], [placeIds]);
  const homePlace = places[0] ?? TIMEZONE_PLACES[0];
  const supportedTimeZones = useMemo(() => getSupportedTimeZones(), []);
  const timeZoneOptions = useMemo(() => supportedTimeZones.map(timeZoneOption), [supportedTimeZones]);
  const quickMatches = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return [];
    const selected = new Set(placeIds);

    return TIMEZONE_PLACES
      .filter((place) => !selected.has(place.id))
      .filter((place) => `${place.name} ${place.country} ${place.timeZone}`.toLowerCase().includes(normalizedQuery))
      .slice(0, 6);
  }, [searchQuery, placeIds]);
  const zoneMatches = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return [];
    const selected = new Set(placeIds);

    return timeZoneOptions
      .filter((option) => !selected.has(customTimeZoneId(option.timeZone)))
      .filter((option) => option.searchText.includes(normalizedQuery))
      .slice(0, 8);
  }, [searchQuery, placeIds, timeZoneOptions]);
  const exactMatch = useMemo(
    () => matchPlaceInput(searchQuery, placeIds) || matchTimeZoneInput(searchQuery, timeZoneOptions, placeIds),
    [searchQuery, placeIds, timeZoneOptions],
  );
  const isSearchSettled = query === searchQuery;
  const timelineDay = useMemo(() => toDateInputValue(selectedDate, homePlace.timeZone), [selectedDate, homePlace.timeZone]);
  const currentPointerTop = TIMELINE_HEADER_HEIGHT + timePositionRatio(now, homePlace.timeZone) * (TIMELINE_ROW_HEIGHT * 24);
  const selectedKey = selectedHourKey(selectedDate, homePlace.timeZone);
  const selectedCell = selectedCellKey(selectedDate, homePlace.timeZone);
  const workRangeSummary = useMemo(() => workRanges.map(workRangeLabel).join(', '), [workRanges]);
  const timelineTableMinWidth = TIMELINE_AXIS_WIDTH + places.length * TIMELINE_COLUMN_WIDTH;
  const timelineRows = useMemo(() => TIMELINE_HOURS.map((hour) => {
    const referenceDate = buildDateFromLocalInput(timelineDay, `${String(hour).padStart(2, '0')}:00`, homePlace.timeZone);
    const isSelected = referenceDate ? selectedHourKey(referenceDate, homePlace.timeZone) === selectedKey : false;
    const tooltipEntries = referenceDate
      ? places.map((place) => ({
        id: place.id,
        label: getPlaceLabel(place, placeLabels),
        relation: dateRelation(referenceDate, place.timeZone, homePlace.timeZone),
        time: formatTime(referenceDate, place.timeZone),
      }))
      : [];
    const cells = referenceDate
      ? places.map((place) => {
        const parts = getTimeParts(referenceDate, place.timeZone);
        const relation = dateRelation(referenceDate, place.timeZone, homePlace.timeZone);

        return {
          id: place.id,
          hour: parts.hour,
          marker: routineMarker(parts.hour, copy),
          relation,
          workRange: getMatchingWorkRange(parts.hour, workRanges),
          isSelectedCell: selectedCellKey(referenceDate, homePlace.timeZone) === selectedCell,
          title: `${getPlaceLabel(place, placeLabels)} ${formatDateLabel(referenceDate, place.timeZone)} ${formatTime(referenceDate, place.timeZone)}`,
        };
      })
      : [];

    return { hour, isSelected, referenceDate, tooltipEntries, cells };
  }), [copy, homePlace.timeZone, placeLabels, places, selectedCell, selectedKey, timelineDay, workRanges]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hasShareState = searchParams.has('zones') || searchParams.has('time');
    if (hasShareState) {
      const state = parseShareState(searchParams);
      setPlaceIds(normalizePlaceIds(state.placeIds));
      if (state.selectedDate) {
        setSelectedDate(state.selectedDate);
      }
      return;
    }

    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}') as {
        placeIds?: string[];
        selectedDate?: string;
        workStart?: number;
        workEnd?: number;
        workRanges?: WorkRange[];
        placeLabels?: Record<string, string>;
      };
      const savedPlaceIds = saved.placeIds?.filter((id) => Boolean(findPlaceById(id)));
      if (savedPlaceIds?.length) {
        setPlaceIds(normalizePlaceIds(savedPlaceIds));
      }
      if (saved.selectedDate) {
        const parsedDate = new Date(saved.selectedDate);
        if (!Number.isNaN(parsedDate.getTime())) {
          setSelectedDate(parsedDate);
        }
      }
      if (Array.isArray(saved.workRanges)) {
        const ranges = saved.workRanges
          .filter((range) => typeof range?.start === 'number' && typeof range?.end === 'number')
          .map(normalizeWorkRange);
        if (ranges.length) {
          setWorkRanges(ranges);
        }
      } else if (typeof saved.workStart === 'number' && typeof saved.workEnd === 'number') {
        setWorkRanges([normalizeWorkRange({ start: saved.workStart, end: saved.workEnd, color: DEFAULT_WORK_RANGE_COLOR })]);
      }
      if (saved.placeLabels && typeof saved.placeLabels === 'object') {
        setPlaceLabels(Object.fromEntries(Object.entries(saved.placeLabels).filter(([id, label]) => Boolean(findPlaceById(id)) && typeof label === 'string' && label.trim())));
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      placeIds,
      selectedDate: selectedDate.toISOString(),
      workRanges,
      placeLabels,
    }));
  }, [placeIds, placeLabels, selectedDate, workRanges]);

  const addPlace = (place: TimezonePlace, source: string = 'quick_match') => {
    setPlaceIds((current) => current.includes(place.id) ? current : [...current, place.id]);
    setQuery('');
    trackTimezone('add_place', {
      place_id: place.id,
      source,
      time_zone: place.timeZone,
      next_zone_count: placeIds.length + 1,
      is_custom: place.id.startsWith('tz:'),
    });
  };

  const addManualTimeZone = () => {
    const place = createCustomPlaceFromTimeZone(manualTimeZone);
    if (!place) {
      trackTimezone('manual_timezone_invalid', {
        time_zone: manualTimeZone,
      });
      return;
    }

    setPlaceIds((current) => current.includes(place.id) ? current : [...current, place.id]);
    setQuery('');
    trackTimezone('add_custom_timezone', {
      source: 'manual_select',
      time_zone: manualTimeZone,
      next_zone_count: placeIds.length + 1,
    });
  };

  const updatePlaceLabel = (place: TimezonePlace, value: string) => {
    const trimmed = value.trim();
    setPlaceLabels((current) => {
      const next = { ...current };
      if (!trimmed || trimmed === place.name) {
        delete next[place.id];
      } else {
        next[place.id] = trimmed;
      }
      return next;
    });
  };

  const trackPlaceLabelEdit = (place: TimezonePlace, value: string) => {
    const trimmed = value.trim();
    trackTimezone(trimmed && trimmed !== place.name ? 'place_label_set' : 'place_label_clear', {
      place_id: place.id,
      label_length: trimmed.length,
    });
  };

  const updateWorkRange = (index: number, patch: Partial<WorkRange>, source?: string) => {
    setWorkRanges((current) => current.map((range, rangeIndex) => rangeIndex === index ? normalizeWorkRange({ ...range, ...patch }) : range));
    if (source) {
      trackTimezone('work_range_update', {
        range_index: index,
        field: source,
        start: patch.start,
        end: patch.end,
        color: patch.color,
      });
    }
  };

  const addWorkRange = () => {
    setWorkRanges((current) => {
      const color = WORK_RANGE_COLORS[current.length % WORK_RANGE_COLORS.length];
      return [...current, { start: 13, end: 17, color }];
    });
    trackTimezone('work_range_add', {
      next_work_range_count: workRanges.length + 1,
    });
  };

  const removeWorkRange = (index: number) => {
    setWorkRanges((current) => current.length > 1 ? current.filter((_, rangeIndex) => rangeIndex !== index) : current);
    trackTimezone('work_range_remove', {
      range_index: index,
      next_work_range_count: Math.max(1, workRanges.length - 1),
    });
  };

  const removePlace = (place: TimezonePlace) => {
    if (place.id === HOME_PLACE_ID) return;
    setPlaceIds((current) => current.filter((id) => id !== place.id));
    trackTimezone('remove_place', {
      place_id: place.id,
      time_zone: place.timeZone,
      next_zone_count: placeIds.length - 1,
    });
  };

  const movePlaceTo = (sourceId: string, targetId: string) => {
    if (sourceId === HOME_PLACE_ID || targetId === HOME_PLACE_ID || sourceId === targetId) return;
    setPlaceIds((current) => {
      const sourceIndex = current.indexOf(sourceId);
      const targetIndex = current.indexOf(targetId);
      if (sourceIndex <= 0 || targetIndex <= 0) return current;
      const next = [...current];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    trackTimezone('drag_reorder_place', {
      place_id: sourceId,
      target_place_id: targetId,
      target_index: placeIds.indexOf(targetId),
    });
  };

  const commitPlaceInput = (value: string) => {
    setSearchQuery(value);
    setQuery(value);
    const trimmed = value.trim();
    if (trimmed) {
      trackTimezone('search_commit', {
        query_length: trimmed.length,
      });
    }
    const place = matchPlaceInput(value, placeIds);
    if (place) {
      addPlace(place, 'search_place_match');
      return;
    }

    const option = matchTimeZoneInput(value, timeZoneOptions, placeIds);
    if (option) {
      const customPlace = createCustomPlaceFromTimeZone(option.timeZone);
      if (customPlace) {
        addPlace(customPlace, 'search_iana_match');
      } else {
        trackTimezone('search_invalid_iana_match', {
          query_length: trimmed.length,
          time_zone: option.timeZone,
        });
      }
      return;
    }

    if (trimmed) {
      trackTimezone('search_no_match', {
        query_length: trimmed.length,
        quick_match_count: quickMatches.length,
        zone_match_count: zoneMatches.length,
      });
    }
  };

  const share = async () => {
    const url = `${window.location.origin}${toolPath('time', lang)}?${encodeShareState(placeIds, selectedDate)}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareState('copied');
      window.setTimeout(() => setShareState('idle'), 1800);
      trackTimezone('share_success', {
        has_custom_zone: placeIds.some((id) => id.startsWith('tz:')),
      });
    } catch {
      window.history.replaceState(null, '', url);
      setShareState('copied');
      trackTimezone('share_fallback', {
        has_custom_zone: placeIds.some((id) => id.startsWith('tz:')),
      });
    }
  };

  return (
    <ToolPageShell>
      <ToolHero
        backHref={homePath(lang)}
        backLabel={copy.back}
        title={copy.title}
        subtitle={copy.subtitle}
      />

      <ToolContentSection className="max-w-none px-4 md:px-6 lg:px-8">
        <GlassPanel className="transform-none overflow-hidden border-white/[0.08] p-0 hover:translate-y-0">
          <div className="border-b border-white/[0.08] p-4 md:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-white">{copy.board}</h2>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-white/54">{copy.compareTip}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={share} className="h-10 rounded-[8px] bg-white px-4 text-sm font-medium text-slate-950 hover:bg-white/88">
                  {shareState === 'copied' ? copy.shared : copy.share}
                </button>
              </div>
            </div>

            <div className="mt-5">
              <input
                list="timezone-place-options"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onBlur={(event) => commitPlaceInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    commitPlaceInput(event.currentTarget.value);
                  }
                }}
                placeholder={copy.addPlaceholder}
                className="h-11 w-full rounded-[8px] border border-white/[0.1] bg-white/[0.045] px-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-cyan-300/45"
              />
              <datalist id="timezone-place-options">
                {quickMatches.map((place) => (
                  <option key={place.id} value={placeInputLabel(place)} />
                ))}
                {zoneMatches.map((option) => (
                  <option key={option.timeZone} value={option.label} />
                ))}
              </datalist>
              {query.trim() && isSearchSettled && !exactMatch && quickMatches.length === 0 && zoneMatches.length === 0 ? (
                <div className="mt-3 grid gap-3 rounded-[8px] border border-white/[0.1] bg-white/[0.035] p-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                  <label className="block text-sm font-medium text-white/62">
                    {copy.noMatch}
                    <select
                      value={manualTimeZone}
                      onChange={(event) => {
                        setManualTimeZone(event.target.value);
                        trackTimezone('manual_timezone_select', {
                          time_zone: event.target.value,
                        });
                      }}
                      className="mt-2 h-11 w-full rounded-[8px] border border-white/[0.10] bg-white/[0.08] px-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] outline-none hover:border-white/[0.18] hover:bg-white/[0.11] focus:border-cyan-300/35 focus:bg-white/[0.13]"
                      aria-label={copy.chooseTimeZone}
                    >
                      {supportedTimeZones.map((timeZone) => (
                        <option key={timeZone} value={timeZone}>{timeZone}</option>
                      ))}
                    </select>
                  </label>
                  <button type="button" onClick={addManualTimeZone} className="h-11 rounded-[8px] bg-white px-4 text-sm font-medium text-slate-950 hover:bg-white/88">
                    {copy.addTimeZone}
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="relative overflow-visible bg-white/[0.02] bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.045),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.035),transparent_28%)] p-4">
            <div className="mb-3 flex justify-end">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    const nextVisible = !showWorkHours;
                    setShowWorkHours(nextVisible);
                    trackTimezone('work_hours_panel_toggle', {
                      visible: nextVisible,
                    });
                  }}
                  className="inline-flex h-8 items-center gap-2 rounded-[8px] border border-white/[0.12] bg-white/[0.045] px-3 text-xs text-white/72 hover:bg-white/[0.08]"
                  aria-expanded={showWorkHours}
                >
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-white/80 text-slate-950" title={copy.workday} aria-hidden="true">
                    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="8" />
                      <path d="M12 8v4l3 2" />
                    </svg>
                  </span>
                  <span>{copy.workHours}</span>
                  <span className="font-mono">{workRangeSummary}</span>
                </button>
                {showWorkHours ? (
                  <div className="absolute right-0 top-10 z-30 grid w-72 gap-2 rounded-[8px] border border-white/[0.12] bg-[rgba(21,33,65,0.98)] p-2.5 shadow-[0_18px_42px_rgba(2,6,23,0.35)]">
                    {workRanges.map((range, index) => (
                      <div key={index} className="grid gap-2 rounded-[8px] border border-white/[0.08] bg-white/[0.035] p-2">
                        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2">
                          <label className="grid gap-1 text-xs text-white/58">
                            {copy.workStart}
                            <select
                              value={range.start}
                              onChange={(event) => updateWorkRange(index, { start: Number(event.target.value) }, 'start')}
                              className="h-8 rounded-[7px] border border-white/[0.10] bg-white/[0.08] px-2 text-xs text-white outline-none focus:border-cyan-300/35"
                            >
                              {TIMELINE_HOURS.slice(0, 23).map((hour) => (
                                <option key={hour} value={hour}>{hour}:00</option>
                              ))}
                            </select>
                          </label>
                          <label className="grid gap-1 text-xs text-white/58">
                            {copy.workEnd}
                            <select
                              value={range.end}
                              onChange={(event) => updateWorkRange(index, { end: Number(event.target.value) }, 'end')}
                              className="h-8 rounded-[7px] border border-white/[0.10] bg-white/[0.08] px-2 text-xs text-white outline-none focus:border-cyan-300/35"
                            >
                              {TIMELINE_HOURS.slice(1).map((hour) => (
                                <option key={hour} value={hour}>{hour}:00</option>
                              ))}
                              <option value={24}>24:00</option>
                            </select>
                          </label>
                          <button
                            type="button"
                            onClick={() => removeWorkRange(index)}
                            disabled={workRanges.length === 1}
                            className="mt-4 flex size-8 items-center justify-center rounded-[7px] border border-white/[0.10] text-white/50 hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                            title={copy.remove}
                          >
                            ×
                          </button>
                        </div>
                        <div className="flex items-center gap-2" aria-label="Work range color">
                          <input
                            type="color"
                            value={range.color}
                            onChange={(event) => updateWorkRange(index, { color: event.target.value })}
                            onBlur={(event) => trackTimezone('work_range_color_custom', {
                              range_index: index,
                              color: event.currentTarget.value,
                            })}
                            className="size-6 cursor-pointer rounded-full border border-white/20 bg-transparent p-0"
                            aria-label="Choose custom work range color"
                          />
                          {WORK_RANGE_COLORS.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => updateWorkRange(index, { color }, 'quick_color')}
                              className={cx(
                                'size-[18px] rounded-full border shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]',
                                range.color === color ? 'border-white ring-2 ring-white/20' : 'border-white/18 hover:border-white/50',
                              )}
                              style={{ backgroundColor: color }}
                              aria-label={`${color} work range`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addWorkRange}
                      className="h-8 rounded-[7px] border border-white/[0.12] text-xs text-white/70 hover:bg-white/[0.08] hover:text-white"
                    >
                      + {copy.addWorkRange}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="overflow-x-auto rounded-[8px] border border-white/[0.10]">
              <div className="relative min-w-full" style={{ minWidth: timelineTableMinWidth }}>
                <div
                  className="pointer-events-none absolute z-50 flex -translate-x-full -translate-y-1/2 items-center rounded-full border border-cyan-200/50 bg-cyan-300 px-2 text-[11px] font-semibold text-slate-950 shadow-[0_10px_30px_rgba(34,211,238,0.20)]"
                  style={{ left: TIMELINE_AXIS_WIDTH, top: currentPointerTop, height: TIMELINE_POINTER_LABEL_HEIGHT }}
                  aria-hidden="true"
                >
                  {formatTime(now, homePlace.timeZone)}
                </div>
                <div className="pointer-events-none absolute left-0 right-0 z-50" style={{ top: currentPointerTop }} aria-hidden="true">
                  <div className="flex h-0.5 items-center">
                    <div className="h-0.5 w-4 bg-cyan-300/85" />
                    <div className="w-[72px]" />
                    <div className="h-0.5 flex-1 bg-cyan-300/85" />
                  </div>
                </div>
                <table className="w-full table-fixed border-collapse" style={{ minWidth: timelineTableMinWidth }}>
                  <colgroup>
                    <col style={{ width: TIMELINE_AXIS_WIDTH, minWidth: TIMELINE_AXIS_WIDTH, maxWidth: TIMELINE_AXIS_WIDTH }} />
                    {places.map((place) => (
                      <col key={place.id} style={{ minWidth: TIMELINE_COLUMN_WIDTH }} />
                    ))}
                  </colgroup>
                  <thead>
                    <tr>
                      <th scope="col" className={cx('sticky left-0 z-20 border-r border-cyan-200/16 shadow-[12px_0_30px_rgba(2,6,23,0.20)]', STICKY_SURFACE)} style={{ width: TIMELINE_AXIS_WIDTH, minWidth: TIMELINE_AXIS_WIDTH, maxWidth: TIMELINE_AXIS_WIDTH, height: TIMELINE_HEADER_HEIGHT }} />
                      {places.map((place, index) => {
                        const liveParts = getTimeParts(now, place.timeZone);
                        const isHomePlace = index === 0;
                        const placeLabel = getPlaceLabel(place, placeLabels);

                        return (
                          <th
                            key={place.id}
                            scope="col"
                            draggable={!isHomePlace}
                            onDragStart={(event) => {
                              if (isHomePlace) return;
                              setDraggedPlaceId(place.id);
                              event.dataTransfer.effectAllowed = 'move';
                              event.dataTransfer.setData('text/plain', place.id);
                            }}
                            onDragOver={(event) => {
                              if (isHomePlace || !draggedPlaceId || draggedPlaceId === place.id) return;
                              event.preventDefault();
                              event.dataTransfer.dropEffect = 'move';
                              setDragTargetPlaceId(place.id);
                            }}
                            onDragLeave={() => setDragTargetPlaceId((current) => current === place.id ? null : current)}
                            onDrop={(event) => {
                              event.preventDefault();
                              const sourceId = event.dataTransfer.getData('text/plain') || draggedPlaceId;
                              if (sourceId) {
                                movePlaceTo(sourceId, place.id);
                              }
                              setDraggedPlaceId(null);
                              setDragTargetPlaceId(null);
                            }}
                            onDragEnd={() => {
                              setDraggedPlaceId(null);
                              setDragTargetPlaceId(null);
                            }}
                            className={cx(
                              'group relative border-l border-white/[0.06] px-3 text-center align-middle',
                              !isHomePlace && 'cursor-grab active:cursor-grabbing',
                              draggedPlaceId === place.id && 'opacity-55',
                              dragTargetPlaceId === place.id && 'bg-cyan-300/[0.10] ring-1 ring-inset ring-cyan-200/30',
                              STICKY_SURFACE,
                            )}
                            style={{ height: TIMELINE_HEADER_HEIGHT }}
                            title={`${placeLabel} · ${place.timeZone}`}
                          >
                            {!isHomePlace ? (
                            <button
                              type="button"
                              onClick={() => removePlace(place)}
                              className="absolute right-1.5 top-1.5 z-30 flex size-5 items-center justify-center rounded-full border border-white/[0.12] bg-[rgba(21,33,65,0.92)] text-[13px] font-normal leading-none text-white/56 opacity-0 shadow-[0_6px_18px_rgba(2,6,23,0.28)] transition-opacity hover:bg-white/[0.12] hover:text-white disabled:hidden group-hover:opacity-100"
                              title={copy.remove}
                              aria-label={`${copy.remove} ${placeLabel}`}
                            >
                              ×
                            </button>
                            ) : null}
                            <div className="pointer-events-none absolute bottom-1.5 right-2 z-0">
                              <MiniClock hour={liveParts.hour} minute={liveParts.minute} />
                            </div>
                            {editingPlaceId === place.id ? (
                              <input
                                value={placeLabels[place.id] ?? place.name}
                                onChange={(event) => updatePlaceLabel(place, event.target.value)}
                                onBlur={(event) => {
                                  trackPlaceLabelEdit(place, event.currentTarget.value);
                                  setEditingPlaceId(null);
                                }}
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter' || event.key === 'Escape') {
                                    event.currentTarget.blur();
                                  }
                                }}
                                className="relative z-40 h-6 w-full rounded-[6px] border border-cyan-200/30 bg-[rgba(15,23,42,0.92)] px-2 text-center text-xs font-semibold text-white outline-none"
                                autoFocus
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPlaceId(place.id);
                                  trackTimezone('place_label_edit_start', {
                                    place_id: place.id,
                                  });
                                }}
                                className="relative z-10 w-full truncate text-xs font-semibold text-white/72 hover:text-white"
                                title={copy.editName}
                              >
                                {placeLabel}
                              </button>
                            )}
                            <div className="relative z-10 mt-0.5 truncate text-[10px] font-medium text-white/40">{liveParts.abbreviation}</div>
                            <div className="relative z-10 mt-0.5 flex items-center justify-center">
                              <span className="truncate font-mono text-lg font-semibold text-white">{formatTime(now, place.timeZone)}</span>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {timelineRows.map((row) => {
                      return (
                        <tr key={row.hour}>
                          <th scope="row" className={cx('group sticky left-0 z-20 border-r border-t border-cyan-200/16 font-mono text-xs font-normal text-white/42 shadow-[12px_0_30px_rgba(2,6,23,0.20)]', STICKY_SURFACE, row.isSelected && 'text-white')} style={{ width: TIMELINE_AXIS_WIDTH, minWidth: TIMELINE_AXIS_WIDTH, maxWidth: TIMELINE_AXIS_WIDTH, height: TIMELINE_ROW_HEIGHT }}>
                            <span>{String(row.hour).padStart(2, '0')}</span>
                            {row.referenceDate ? (
                              <div className="pointer-events-none absolute left-[calc(100%+8px)] top-1/2 z-40 hidden min-w-44 -translate-y-1/2 rounded-[8px] border border-white/[0.12] bg-[rgba(21,33,65,0.98)] p-2 text-left font-sans text-[11px] font-normal text-white/72 shadow-[0_18px_42px_rgba(2,6,23,0.35)] group-hover:block">
                                {row.tooltipEntries.map((entry) => (
                                  <div key={entry.id} className="flex items-center justify-between gap-4">
                                    <span className="max-w-24 truncate text-white/48">{entry.label}:</span>
                                    <span className="font-mono text-white/82">
                                      {entry.time}
                                      {entry.relation !== 'same' ? <span className="ml-1 text-white/38">{entry.relation === 'next' ? '+1' : '-1'}</span> : null}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </th>
                          {row.cells.map((cell) => {
                            if (!row.referenceDate) return null;
                            return (
                              <td key={cell.id} className="border-l border-t border-white/[0.06] p-0" style={{ height: TIMELINE_ROW_HEIGHT }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!row.referenceDate) return;
                                    setSelectedDate(row.referenceDate);
                                    trackTimezone('select_time', {
                                      reference_hour: row.hour,
                                      place_id: cell.id,
                                      local_hour: cell.hour,
                                      date_relation: cell.relation,
                                      inside_work_range: Boolean(cell.workRange),
                                    });
                                  }}
                                  className={cx(
                                    'relative flex h-full w-full items-center justify-center px-1 text-center font-mono transition-colors hover:bg-white/[0.07]',
                                    cell.workRange ? 'text-white' : 'bg-slate-950/[0.24] text-white/34',
                                    row.isSelected && 'ring-1 ring-inset ring-white/[0.08]',
                                    cell.isSelectedCell && 'ring-1 ring-inset ring-cyan-100/22 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]',
                                  )}
                                  style={cell.workRange ? { backgroundColor: hexToRgba(cell.workRange.color, 0.18) } : undefined}
                                  title={cell.title}
                                  aria-label={cell.title}
                                >
                                  <span className="text-sm font-semibold">{String(cell.hour).padStart(2, '0')}</span>
                                  {cell.relation !== 'same' ? (
                                    <span className="ml-1 text-[10px] text-white/42">{cell.relation === 'next' ? '+1' : '-1'}</span>
                                  ) : null}
                                  {cell.marker ? (
                                    <span className={cx('absolute right-1 top-1 flex size-4 items-center justify-center', cell.marker.icon === 'moon' && 'rounded-full', cell.marker.className)} title={cell.marker.label} aria-label={cell.marker.label}>
                                      <RoutineIcon icon={cell.marker.icon} />
                                    </span>
                                  ) : null}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </GlassPanel>
      </ToolContentSection>

      <ToolContentSection className="max-w-5xl px-4 md:px-6 lg:px-8">
        <section className="grid gap-4 border-t border-white/[0.08] pt-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-white/48">{copy.faqTitle}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {copy.faqItems.map((item) => (
              <div key={item.question} className="rounded-[8px] border border-white/[0.08] bg-white/[0.025] p-4">
                <h3 className="text-sm font-semibold text-white">{item.question}</h3>
                <p className="mt-2 text-sm leading-6 text-white/58">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </ToolContentSection>

      <Foot />
    </ToolPageShell>
  );
}
