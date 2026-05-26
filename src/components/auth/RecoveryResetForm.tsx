import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { sendMessage } from "@/shared/messages";

export interface RecoveryResetFormProps {
  question: string;
  onSuccess: () => void;
  onCancel: () => void;
}

type Step = "answer" | "password";

export function RecoveryResetForm({ question, onSuccess, onCancel }: RecoveryResetFormProps) {
  const [step, setStep] = useState<Step>("answer");
  const [answer, setAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleCancel() {
    await sendMessage({ type: "CANCEL_RECOVERY_RESET" });
    onCancel();
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await sendMessage({ type: "VERIFY_RECOVERY_ANSWER", answer });
      if (!res.ok) {
        setError(res.error ?? "Incorrect answer");
        return;
      }
      setStep("password");
    } finally {
      setBusy(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setBusy(true);
    try {
      const res = await sendMessage({ type: "RESET_MASTER_PASSWORD", newPassword });
      if (!res.ok) {
        setError(res.error ?? "Reset failed");
        if (res.error?.includes("recovery question first")) {
          setStep("answer");
        }
        return;
      }
      onSuccess();
    } finally {
      setBusy(false);
    }
  }

  async function handleBackToAnswer() {
    await sendMessage({ type: "CANCEL_RECOVERY_RESET" });
    setStep("answer");
    setNewPassword("");
    setConfirm("");
    setError(null);
  }

  if (step === "answer") {
    return (
      <form onSubmit={handleVerify} className="mt-2 space-y-2">
        <p className="text-[11px] text-perfil-muted">Step 1 of 2 — confirm your recovery answer</p>
        <p className="rounded-md border border-perfil-border bg-perfil-bg/50 px-2 py-1.5 text-[11px] font-medium text-perfil-text">
          {question}
        </p>
        <Input
          label="Your answer"
          type="password"
          autoComplete="off"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          required
        />
        {error && (
          <p className="text-[11px] text-perfil-danger" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" fullWidth disabled={busy} className="btn-compact">
          {busy ? "Checking…" : "Continue"}
        </Button>
        <button
          type="button"
          className="w-full text-center text-[11px] text-perfil-muted hover:text-perfil-text"
          onClick={() => void handleCancel()}
        >
          Back to unlock
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleReset} className="mt-2 space-y-2">
      <p className="text-[11px] text-perfil-success">Answer verified</p>
      <p className="text-[11px] text-perfil-muted">Step 2 of 2 — choose a new master password</p>
      <Input
        label="New master password"
        type="password"
        autoComplete="new-password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        minLength={8}
        required
      />
      <Input
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
      />
      {error && (
        <p className="text-[11px] text-perfil-danger" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" fullWidth disabled={busy} className="btn-compact">
        {busy ? "Saving…" : "Set new password"}
      </Button>
      <button
        type="button"
        className="w-full text-center text-[11px] text-perfil-muted hover:text-perfil-text"
        onClick={() => void handleBackToAnswer()}
      >
        Back to answer
      </button>
    </form>
  );
}
