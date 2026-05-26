import { initContent } from "@/content/index";

export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_idle",
  main() {
    initContent();
  },
});
