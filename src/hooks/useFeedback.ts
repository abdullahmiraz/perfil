import { useCallback, useState } from "react";
import type { ToastVariant } from "@/components/ui/Toast";

export interface FeedbackState {
  message: string;
  variant: ToastVariant;
}

export function useFeedback() {
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const clear = useCallback(() => setFeedback(null), []);

  const show = useCallback((message: string, variant: ToastVariant = "success") => {
    setFeedback({ message, variant });
  }, []);

  const showSuccess = useCallback((message: string) => show(message, "success"), [show]);
  const showError = useCallback((message: string) => show(message, "error"), [show]);

  return { feedback, showSuccess, showError, clear };
}
