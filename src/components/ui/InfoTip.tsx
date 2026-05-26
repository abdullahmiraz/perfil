import { useEffect, useRef, useState } from "react";

export interface InfoTipProps {
  text: string;
  label?: string;
}

export function InfoTip({ text, label = "More info" }: InfoTipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        className="flex h-5 w-5 items-center justify-center rounded-full border border-perfil-border text-[10px] font-bold text-perfil-muted hover:border-perfil-accent hover:text-perfil-accent"
      >
        i
      </button>
      {open && (
        <div
          role="tooltip"
          className="absolute right-0 top-6 z-50 w-52 rounded-lg border border-perfil-border bg-perfil-surface p-2.5 text-[11px] leading-snug text-perfil-muted shadow-lg"
        >
          {text}
        </div>
      )}
    </div>
  );
}
