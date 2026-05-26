import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

const VIEWPORT_PAD = 8;
const GAP = 6;
const SHOW_DELAY_MS = 280;

export interface HoverTipProps {
  text: string;
  children: ReactNode;
  /** Extra classes on the trigger wrapper */
  className?: string;
}

export function HoverTip({ text, children, className = "" }: HoverTipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; maxWidth: number } | null>(
    null,
  );
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useLayoutEffect(() => {
    if (!visible || !triggerRef.current || !tipRef.current) {
      setCoords(null);
      return;
    }

    const rect = triggerRef.current.getBoundingClientRect();
    const tip = tipRef.current;
    const maxWidth = Math.min(260, window.innerWidth - VIEWPORT_PAD * 2);
    tip.style.maxWidth = `${maxWidth}px`;
    const height = tip.offsetHeight;
    const width = tip.offsetWidth;

    let top = rect.top - height - GAP;
    if (top < VIEWPORT_PAD) top = rect.bottom + GAP;
    top = Math.min(top, window.innerHeight - height - VIEWPORT_PAD);

    let left = rect.left + rect.width / 2 - width / 2;
    left = Math.max(VIEWPORT_PAD, Math.min(left, window.innerWidth - width - VIEWPORT_PAD));

    setCoords({ top, left, maxWidth });
  }, [visible, text]);

  function showSoon() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
  }

  function hide() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  }

  return (
    <>
      <span
        ref={triggerRef}
        className={["inline-flex max-w-full", className].join(" ")}
        onMouseEnter={showSoon}
        onMouseLeave={hide}
        onFocus={showSoon}
        onBlur={hide}
      >
        {children}
      </span>
      {visible &&
        createPortal(
          <div
            ref={tipRef}
            role="tooltip"
            style={{
              position: "fixed",
              top: coords?.top ?? -9999,
              left: coords?.left ?? VIEWPORT_PAD,
              maxWidth: coords?.maxWidth ?? 260,
              visibility: coords ? "visible" : "hidden",
              zIndex: 2147483647,
              pointerEvents: "none",
            }}
            className="rounded-md border border-perfil-border bg-perfil-surface px-2 py-1.5 text-[11px] leading-snug text-perfil-text shadow-lg"
          >
            {text}
          </div>,
          document.body,
        )}
    </>
  );
}
