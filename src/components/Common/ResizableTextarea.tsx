"use client"

import { useCallback, useRef, useState, type TextareaHTMLAttributes } from 'react';

type ResizableTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  containerClassName?: string;
  textareaClassName?: string;
  initialHeight?: number;
  minHeight?: number;
  maxHeight?: number;
  resizeTitle?: string;
};

export default function ResizableTextarea({
  containerClassName = '',
  textareaClassName = '',
  initialHeight = 208,
  minHeight = 144,
  maxHeight = 640,
  resizeTitle = 'Drag to resize',
  style,
  ...props
}: ResizableTextareaProps) {
  const [height, setHeight] = useState(initialHeight);
  const resizeStartRef = useRef<{ y: number; height: number } | null>(null);

  const startResize = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    resizeStartRef.current = {
      y: event.clientY,
      height,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!resizeStartRef.current) return;

      const nextHeight = resizeStartRef.current.height + moveEvent.clientY - resizeStartRef.current.y;
      setHeight(Math.max(minHeight, Math.min(maxHeight, nextHeight)));
    };

    const handlePointerUp = () => {
      resizeStartRef.current = null;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }, [height, maxHeight, minHeight]);

  return (
    <div className={`overflow-hidden rounded-[18px] border border-white/[0.08] bg-white/[0.035] transition-colors duration-200 focus-within:border-white/[0.18] focus-within:ring-2 focus-within:ring-white/20 ${containerClassName}`}>
      <textarea
        {...props}
        className={`block w-full resize-none bg-transparent px-4 py-3 font-mono text-sm leading-6 text-white outline-none placeholder:text-white/28 ${textareaClassName}`}
        style={{ ...style, height }}
      />
      <div
        role="separator"
        aria-orientation="horizontal"
        title={resizeTitle}
        onPointerDown={startResize}
        className="flex h-4 cursor-row-resize touch-none items-center justify-center border-t border-white/[0.06] bg-white/[0.035] transition-colors duration-200 hover:bg-white/[0.07]"
      >
        <span className="h-0.5 w-10 rounded-full bg-white/22" />
      </div>
    </div>
  );
}
