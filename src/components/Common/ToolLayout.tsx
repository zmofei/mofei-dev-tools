"use client";

import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { PrimaryPillLink, SectionLabel } from '@mofei-dev/ui';

export const TOOL_PAGE_CONTAINER_CLASS = 'mx-auto max-w-[2000px] px-5 md:px-10 lg:px-16';
export const TOOL_PAGE_HERO_CLASS = `${TOOL_PAGE_CONTAINER_CLASS} pb-8 pt-6 md:pb-10 md:pt-8 lg:pb-12 lg:pt-12`;
export const TOOL_PAGE_CONTENT_CLASS = `${TOOL_PAGE_CONTAINER_CLASS} pb-10 pt-2 md:pb-14 lg:pb-20`;

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(' ');
}

type ToolPageShellProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  mainClassName?: string;
};

export function ToolPageShell({
  children,
  className,
  mainClassName,
  ...props
}: ToolPageShellProps) {
  return (
    <div className={cx('min-h-screen flex flex-col', className)} {...props}>
      <main className={cx('flex-1 pt-10', mainClassName)}>{children}</main>
    </div>
  );
}

type ToolHeroProps = {
  backHref: string;
  backLabel: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
  actions?: ReactNode;
  infoSections?: Array<{
    title: ReactNode;
    body: ReactNode;
  }>;
  relatedTools?: Array<{
    href: string;
    label: ReactNode;
  }>;
  eyebrow?: ReactNode;
  titleProps?: HTMLAttributes<HTMLHeadingElement>;
  descriptionProps?: HTMLAttributes<HTMLParagraphElement>;
};

export function ToolHero({
  backHref,
  backLabel,
  title,
  subtitle,
  actions,
  infoSections,
  relatedTools,
  eyebrow = 'MOFEI DEV TOOLS',
  titleProps,
  descriptionProps,
}: ToolHeroProps) {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const infoRef = useRef<HTMLSpanElement | null>(null);
  const { className: titleClassName, ...restTitleProps } = titleProps ?? {};
  const { className: descriptionClassName, ...restDescriptionProps } = descriptionProps ?? {};

  useEffect(() => {
    if (!isInfoOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!infoRef.current?.contains(event.target as Node)) {
        setIsInfoOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsInfoOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isInfoOpen]);

  return (
    <section className={TOOL_PAGE_HERO_CLASS}>
      <div className="max-w-5xl">
        <PrimaryPillLink
          href={backHref}
          className="min-h-10 transform-none px-4 text-sm hover:translate-x-0 hover:translate-y-0"
        >
          <span aria-hidden="true">←</span>
          {backLabel}
        </PrimaryPillLink>

        <SectionLabel className="mt-8">{eyebrow}</SectionLabel>
        <h1
          className={cx(
            'mt-5 max-w-4xl text-[40px] font-semibold leading-[0.98] tracking-[-0.02em] text-white md:text-[58px] lg:text-[68px]',
            titleClassName,
          )}
          {...restTitleProps}
        >
          {title}
        </h1>
        <p
          className={cx(
            'mt-6 max-w-3xl text-base leading-8 text-white/72 md:text-lg md:leading-9',
            descriptionClassName,
          )}
          {...restDescriptionProps}
        >
          {subtitle}
          {infoSections?.length ? (
            <span ref={infoRef} className="relative ml-2 inline-flex align-middle">
              <button
                type="button"
                onClick={() => setIsInfoOpen((open) => !open)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.045] text-sm font-semibold leading-none text-white/62 transition-colors hover:border-white/[0.22] hover:bg-white/[0.08] hover:text-white"
                aria-expanded={isInfoOpen}
                aria-label="Tool information"
                title="Tool information"
              >
                i
              </button>
              {isInfoOpen ? (
                <span className="absolute left-0 top-9 z-20 block w-[min(24rem,calc(100vw-2.5rem))] rounded-[8px] border border-white/[0.1] bg-slate-950/94 p-4 text-left shadow-2xl backdrop-blur-xl">
                  {infoSections.map((section, index) => (
                    <span key={index} className={index === 0 ? 'block' : 'mt-4 block'}>
                      <span className="block text-sm font-semibold leading-5 text-white/84">{section.title}</span>
                      <span className="mt-2 block text-sm leading-6 text-white/62">{section.body}</span>
                    </span>
                  ))}
                </span>
              ) : null}
            </span>
          ) : null}
        </p>
        {relatedTools?.length ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {relatedTools.map((tool) => (
              <PrimaryPillLink
                key={String(tool.href)}
                href={tool.href}
                className="min-h-10 transform-none px-4 text-sm hover:translate-x-0 hover:translate-y-0"
              >
                {tool.label}
                <span aria-hidden="true">→</span>
              </PrimaryPillLink>
            ))}
          </div>
        ) : null}
        {actions ? <div className="mt-8">{actions}</div> : null}
      </div>
    </section>
  );
}

type ToolContentSectionProps = {
  children: ReactNode;
  className?: string;
};

export function ToolContentSection({ children, className }: ToolContentSectionProps) {
  return <section className={cx(TOOL_PAGE_CONTENT_CLASS, className)}>{children}</section>;
}

export function ToolLoadingFallback({ className }: { className?: string }) {
  return (
    <ToolPageShell className={className}>
      <div className={cx(TOOL_PAGE_CONTAINER_CLASS, 'py-6 md:py-8 lg:py-12')}>
        <div className="flex h-64 items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    </ToolPageShell>
  );
}
