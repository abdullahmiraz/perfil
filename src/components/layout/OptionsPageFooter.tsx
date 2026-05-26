import { getTestFormPageUrl } from "@/lib/extension-pages";

export function OptionsPageFooter() {
  const testFormUrl = getTestFormPageUrl();

  return (
    <footer className="mt-6 border-t border-perfil-border pt-3 text-[11px] text-perfil-muted">
      <p>
        Sample form for testing fill:{" "}
        <a
          href={testFormUrl}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-perfil-accent hover:underline"
        >
          Open test form
        </a>
        <span className="text-perfil-muted/80"> (extension page — works without port 3000)</span>
      </p>
      <p className="mt-1">
        With <code className="text-perfil-text">npm run dev</code> running:{" "}
        <a
          href="http://localhost:3000/test-form.html"
          target="_blank"
          rel="noreferrer"
          className="text-perfil-accent hover:underline"
        >
          localhost:3000/test-form.html
        </a>
      </p>
    </footer>
  );
}
