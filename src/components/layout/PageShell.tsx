import type { ReactNode } from "react";

export interface PageShellProps {
  children: ReactNode;
  width?: "popup" | "options";
}

const WIDTH_CLASS = {
  popup: "w-[320px] p-4",
  options: "mx-auto max-w-2xl px-4 py-4 md:px-5 md:py-5",
};

export function PageShell({ children, width = "popup" }: PageShellProps) {
  return <div className={WIDTH_CLASS[width]}>{children}</div>;
}
