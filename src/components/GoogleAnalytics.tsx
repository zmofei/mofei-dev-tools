"use client";

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

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
  if (typeof window !== 'undefined' && window.gtag && GA_TRACKING_ID) {
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
  if (typeof window !== 'undefined' && window.gtag) {
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

export default function GoogleAnalytics() {
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
