import type { ReactNode } from "react";

export interface PageShellProps {
  children: ReactNode;
  width?: "popup" | "options";
}

const WIDTH_CLASS = {
  popup: "w-[360px] p-5",
  options: "mx-auto max-w-3xl p-8 md:p-10",
};

export function PageShell({ children, width = "popup" }: PageShellProps) {
  return <div className={WIDTH_CLASS[width]}>{children}</div>;
}
