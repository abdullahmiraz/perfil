import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/** Standalone fill API harness (not bundled into the extension). */
export default defineConfig({
  root: path.resolve(__dirname, "tools/harness"),
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
