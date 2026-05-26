import { useRef, useState } from "react";
import { fillForm, readFormValues, scanForm, type FillReport, type ScanReport } from "@/lib/fill-api";
import { harnessFormHtml, harnessProfile } from "@/lib/fixtures/harness";
import "@/styles/globals.css";

export function HarnessApp() {
  const formRef = useRef<HTMLDivElement>(null);
  const profile = harnessProfile;
  const [scan, setScan] = useState<ScanReport | null>(null);
  const [fill, setFill] = useState<FillReport | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  function root() {
    return formRef.current ?? document;
  }

  function runScan() {
    const report = scanForm(profile, root());
    setScan(report);
    setFill(null);
    setValues(readFormValues(root()));
  }

  function runFill() {
    const report = fillForm(profile, root());
    setFill(report);
    setScan(scanForm(profile, root()));
    setValues(readFormValues(root()));
  }

  function reset() {
    if (!formRef.current) return;
    formRef.current.innerHTML = harnessFormHtml;
    setScan(null);
    setFill(null);
    setValues({});
  }

  return (
    <div className="min-h-screen bg-perfil-bg text-perfil-text">
      <header className="border-b border-perfil-border px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">Perfil Dev Harness</h1>
        <p className="text-sm text-perfil-muted">
          Live scan/fill API — profile from <code className="text-perfil-accent">fixtures/profiles/demo.json</code>
        </p>
      </header>

      <div className="grid gap-6 p-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-perfil-border bg-perfil-surface p-5">
          <div className="mb-4 flex flex-wrap gap-2">
            <button type="button" className="btn-primary !w-auto" onClick={runScan}>
              Scan
            </button>
            <button type="button" className="btn-primary !w-auto" onClick={runFill}>
              Fill
            </button>
            <button type="button" className="btn-secondary !w-auto px-4" onClick={reset}>
              Reset form
            </button>
          </div>

          <div
            ref={formRef}
            className="harness-form space-y-3"
            dangerouslySetInnerHTML={{ __html: harnessFormHtml }}
          />

          {Object.keys(values).length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-perfil-muted">
                Current field values
              </h3>
              <pre className="mt-2 overflow-auto rounded-xl bg-perfil-bg p-3 text-xs">
                {JSON.stringify(values, null, 2)}
              </pre>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <ReportPanel title="Scan report" data={scan} empty="Click Scan to analyze fields" />
          <ReportPanel title="Fill report" data={fill} empty="Click Fill to autofill matched fields" />
        </section>
      </div>

      <style>{`
        .harness-form label { display: block; margin-top: 0.75rem; font-size: 0.75rem; color: #8b9cb3; }
        .harness-form input { width: 100%; margin-top: 0.25rem; padding: 0.5rem 0.75rem; border-radius: 0.75rem;
          border: 1px solid #263044; background: #0c1017; color: #eef2f7; font-size: 0.875rem; }
      `}</style>
    </div>
  );
}

function ReportPanel({
  title,
  data,
  empty,
}: {
  title: string;
  data: ScanReport | FillReport | null;
  empty: string;
}) {
  if (!data) {
    return (
      <div className="rounded-2xl border border-perfil-border bg-perfil-surface p-5">
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-perfil-muted">{empty}</p>
      </div>
    );
  }

  const isScan = "matchCount" in data;
  const rows = isScan ? data.rows : data.rows;

  return (
    <div className="rounded-2xl border border-perfil-border bg-perfil-surface p-5">
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-perfil-muted">
        {isScan
          ? `${data.matchCount} / ${data.fieldCount} fields will fill`
          : `Filled ${data.filled}, skipped ${data.skipped}`}
      </p>
      <div className="mt-4 overflow-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-perfil-muted">
              <th className="pb-2 pr-2">Label</th>
              <th className="pb-2 pr-2">Maps to</th>
              <th className="pb-2 pr-2">Conf.</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-perfil-border/50">
                <td className="py-2 pr-2">{row.label}</td>
                <td className="py-2 pr-2 font-mono text-perfil-accent">
                  {"fieldKey" in row ? row.fieldKey : "—"}
                </td>
                <td className="py-2 pr-2">
                  {"confidence" in row && row.confidence != null
                    ? `${Math.round(row.confidence * 100)}%`
                    : "filled" in row
                      ? row.filled
                        ? "✓"
                        : "✗"
                      : "—"}
                </td>
                <td className="py-2">
                  {"willFill" in row
                    ? row.willFill
                      ? "will fill"
                      : "skip"
                    : row.filled
                      ? "filled"
                      : "miss"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <pre className="mt-4 max-h-48 overflow-auto rounded-xl bg-perfil-bg p-3 text-[10px] text-perfil-muted">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
