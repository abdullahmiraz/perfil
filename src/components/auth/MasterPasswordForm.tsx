import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export interface MasterPasswordFormProps {
  mode: "setup" | "unlock";
  busy?: boolean;
  error?: string | null;
  onSubmit: (password: string) => Promise<void>;
}

export function MasterPasswordForm({ mode, busy = false, error, onSubmit }: MasterPasswordFormProps) {
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(password);
    setPassword("");
  }

  const isSetup = mode === "setup";

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <Input
        label="Master password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={isSetup ? "At least 8 characters" : undefined}
        minLength={isSetup ? 8 : undefined}
        required
      />
      {error && <Alert variant="error">{error}</Alert>}
      <Button type="submit" fullWidth disabled={busy}>
        {busy ? (isSetup ? "Creating…" : "Unlocking…") : isSetup ? "Create vault" : "Unlock"}
      </Button>
    </form>
  );
}
