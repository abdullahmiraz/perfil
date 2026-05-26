import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const VIEWPORT_PAD = 8;
const GAP = 6;

export interface InfoTipProps {
  text: string;
  label?: string;
}

export function InfoTip({ text, label = "More info" }: InfoTipProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; maxWidth: number } | null>(
    null,
  );
  const btnRef = useRef<HTMLButtonElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !btnRef.current || !tipRef.current) {
      setCoords(null);
      return;
    }

    const btn = btnRef.current.getBoundingClientRect();
    const tip = tipRef.current;
    const maxWidth = window.innerWidth - VIEWPORT_PAD * 2;
    const height = tip.offsetHeight;

    let top = btn.top - height - GAP;
    if (top < VIEWPORT_PAD) {
      top = btn.bottom + GAP;
    }
    top = Math.min(top, window.innerHeight - height - VIEWPORT_PAD);

    setCoords({
      top,
      left: VIEWPORT_PAD,
      maxWidth,
    });
  }, [open, text]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || tipRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-perfil-border text-[10px] font-bold text-perfil-muted hover:border-perfil-accent hover:text-perfil-accent"
      >
        i
      </button>
      {open &&
        createPortal(
          <div
            ref={tipRef}
            role="tooltip"
            style={{
              position: "fixed",
              top: coords?.top ?? -9999,
              left: coords?.left ?? VIEWPORT_PAD,
              maxWidth: coords?.maxWidth ?? window.innerWidth - VIEWPORT_PAD * 2,
              visibility: coords ? "visible" : "hidden",
              zIndex: 2147483647,
            }}
            className="rounded-lg border border-perfil-border bg-perfil-surface p-2.5 text-[11px] leading-snug text-perfil-muted shadow-lg"
          >
            {text}
          </div>,
          document.body,
        )}
    </>
  );
}
