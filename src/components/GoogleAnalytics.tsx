"use client";

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// 声明 gtag 函数
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
  }
}

// Google Analytics 页面浏览追踪
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag && GA_TRACKING_ID && hasAnalyticsConsent()) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Google Analytics 事件追踪
type GAEventParams = Record<string, string | number | boolean | null | undefined>;

// Google Analytics 事件追踪
export const event = (
  action: string,
  category: string,
  labelOrParams?: string | GAEventParams,
  value?: number,
) => {
  if (typeof window !== 'undefined' && window.gtag && hasAnalyticsConsent()) {
    const eventParams = typeof labelOrParams === 'object' && labelOrParams !== null
      ? {
          event_category: category,
          ...labelOrParams,
        }
      : {
          event_category: category,
          event_label: labelOrParams,
          value: value,
        };

    window.gtag('event', action, {
      ...eventParams,
    });
  }
};

function pagePathWithSearch(pathname: string, searchParams: URLSearchParams) {
  const queryString = searchParams.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

// 页面浏览追踪组件 - 使用 Suspense 包装
function PageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (GA_TRACKING_ID) {
      const url = pagePathWithSearch(pathname, searchParams);
      pageview(url);
    }
  }, [pathname, searchParams]);

  return null;
}

const CONSENT_KEY = 'mofei-tools-analytics-consent-v1';

function hasAnalyticsConsent() {
  try {
    return localStorage.getItem(CONSENT_KEY) === 'granted';
  } catch {
    return false;
  }
}

function clearAnalyticsCookies(trackingId: string) {
  const streamCookie = `_ga_${trackingId.replace(/^G-/, '')}`;
  for (const name of ['_ga', streamCookie]) {
    document.cookie = `${name}=; Max-Age=0; Path=/`;
    document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${location.hostname}`;
    if (location.hostname.endsWith('.mofei.life')) {
      document.cookie = `${name}=; Max-Age=0; Path=/; Domain=mofei.life`;
    }
  }
}

function AnalyticsScripts() {
  // 如果没有配置 GA ID，则不渲染任何内容
  if (!GA_TRACKING_ID) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              send_page_view: false,
            });
          `,
        }}
      />
      <PageTracker />
    </>
  );
}

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const chinese = pathname === '/zh' || pathname.startsWith('/zh/');

  useEffect(() => {
    const syncConsent = () => {
      const granted = hasAnalyticsConsent();
      if (GA_TRACKING_ID) {
        Reflect.set(window, `ga-disable-${GA_TRACKING_ID}`, !granted);
        if (!granted) clearAnalyticsCookies(GA_TRACKING_ID);
      }
      setEnabled(granted);
    };
    syncConsent();
    window.addEventListener('storage', syncConsent);
    return () => window.removeEventListener('storage', syncConsent);
  }, []);

  if (!GA_TRACKING_ID) return null;

  function chooseAnalytics(granted: boolean) {
    try {
      localStorage.setItem(CONSENT_KEY, granted ? 'granted' : 'denied');
    } catch {
      if (granted) return;
    }
    Reflect.set(window, `ga-disable-${GA_TRACKING_ID}`, !granted);
    if (!granted && GA_TRACKING_ID) clearAnalyticsCookies(GA_TRACKING_ID);
    setEnabled(granted);
    setOpen(false);
  }

  return (
    <>
      {enabled && <AnalyticsScripts />}
      <div className="fixed bottom-3 left-3 z-50 rounded-lg bg-slate-900 px-3 py-2 text-sm text-white">
        <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
          {chinese ? 'Cookie 设置' : 'Cookie settings'}
        </button>
        {open && (
          <div className="mt-2 flex flex-wrap gap-3">
            <button type="button" onClick={() => chooseAnalytics(true)}>
              {chinese ? '允许分析' : 'Allow analytics'}
            </button>
            <button type="button" onClick={() => chooseAnalytics(false)}>
              {chinese ? '仅必要' : 'Necessary only'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
