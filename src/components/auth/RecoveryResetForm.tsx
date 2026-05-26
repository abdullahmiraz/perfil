import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { sendMessage } from "@/shared/messages";

export interface RecoveryResetFormProps {
  question: string;
  busy?: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export function RecoveryResetForm({
  question,
  busy = false,
  onSuccess,
  onCancel,
}: RecoveryResetFormProps) {
  const [answer, setAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
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
    const res = await sendMessage({
      type: "RESET_MASTER_PASSWORD",
      answer,
      newPassword,
    });
    if (!res.ok) {
      setError(res.error ?? "Reset failed");
      return;
    }
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-2">
      <p className="text-[11px] text-perfil-muted">
        Answer your recovery question to set a new master password.
      </p>
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
        {busy ? "Resetting…" : "Set new password"}
      </Button>
      <button
        type="button"
        className="w-full text-center text-[11px] text-perfil-muted hover:text-perfil-text"
        onClick={onCancel}
      >
        Back to unlock
      </button>
    </form>
  );
}
