#!/usr/bin/env node
/**
 * Full verification + fill API smoke test.
 * Writes test-results/verification-report.json and verification-report.html
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "test-results");

function run(cmd, args) {
  const r = spawnSync(cmd, args, { cwd: root, shell: true, encoding: "utf8" });
  return { ok: r.status === 0, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
}

mkdirSync(outDir, { recursive: true });

const steps = [];
const typecheck = run("npm", ["run", "typecheck"]);
steps.push({ name: "typecheck", ok: typecheck.ok, output: typecheck.stderr || typecheck.stdout });

const test = run("npm", ["test"]);
steps.push({ name: "vitest", ok: test.ok, output: test.stdout });

const demo = run("npx", ["vitest", "run", "--config", "vitest.demo.config.ts"]);
steps.push({ name: "fill-api-demo", ok: demo.ok, output: demo.stdout });

const build = run("npm", ["run", "build"]);
steps.push({ name: "build", ok: build.ok, output: build.stderr || build.stdout });

// Fill API smoke via vitest fill-api.test (already in npm test) — extract summary from vitest output
const fillApiOk = /fill-api\.test\.ts[\s\S]*?✓|fill-api[\s\S]*passed/i.test(test.stdout);

let fillDemo = null;
try {
  fillDemo = JSON.parse(
    readFileSync(join(outDir, "fill-demo.json"), "utf8"),
  );
} catch {
  /* demo step may have failed */
}

const report = {
  timestamp: new Date().toISOString(),
  allPassed: steps.every((s) => s.ok),
  fillApiVerified: fillApiOk,
  fillDemo,
  steps,
  harnessUrl: "http://localhost:5173/dev-harness.html",
  testFormUrl: "http://localhost:5173/test-form.html",
};

writeFileSync(join(outDir, "verification-report.json"), JSON.stringify(report, null, 2));

const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><title>Perfil Verification</title>
<style>
body{font-family:system-ui,sans-serif;background:#0c1017;color:#eef2f7;padding:2rem;max-width:900px;margin:0 auto}
.pass{color:#34d399}.fail{color:#f87171}
pre{background:#151c28;padding:1rem;border-radius:12px;overflow:auto;font-size:12px}
a{color:#4a9ff5}
</style></head><body>
<h1>Perfil verification ${report.allPassed ? '<span class="pass">PASSED</span>' : '<span class="fail">FAILED</span>'}</h1>
<p>${report.timestamp}</p>
<ul>${steps.map((s) => `<li class="${s.ok ? "pass" : "fail"}">${s.name}: ${s.ok ? "OK" : "FAIL"}</li>`).join("")}</ul>
<p>Live UI harness: <a href="${report.harnessUrl}">${report.harnessUrl}</a> (run <code>npm run dev:harness</code>)</p>
<p>Static test form: <a href="${report.testFormUrl}">${report.testFormUrl}</a></p>
${report.fillDemo ? `<h2>Fill API results (automated)</h2>
<table border="1" cellpadding="6" style="border-collapse:collapse;width:100%">
<tr><th>Field</th><th>Maps to</th><th>Value</th><th>Filled</th></tr>
${report.fillDemo.fill.rows.map((r) => `<tr><td>${r.label}</td><td>${r.fieldKey}</td><td>${r.value}</td><td>${r.filled ? "✓" : "✗"}</td></tr>`).join("")}
</table>
<p>Scan: ${report.fillDemo.scan.matchCount}/${report.fillDemo.scan.fieldCount} fields matched · Fill: ${report.fillDemo.fill.filled} filled, ${report.fillDemo.fill.skipped} skipped</p>` : ""}
<h2>Outputs</h2>
${steps.map((s) => `<h3>${s.name}</h3><pre>${escapeHtml(s.output.slice(-2000))}</pre>`).join("")}
</body></html>`;

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

writeFileSync(join(outDir, "verification-report.html"), html);

console.log(report.allPassed ? "✓ All verification steps passed" : "✗ Verification failed");
console.log(`Report: test-results/verification-report.html`);
process.exit(report.allPassed ? 0 : 1);
