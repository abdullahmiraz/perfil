import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CompactToggle } from "@/components/ui/CompactToggle";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { RECOVERY_QUESTION_PRESETS } from "@/lib/vault-recovery";
import type { AutoLockMinutes, VaultSetupOptions } from "@/types/vault";

export interface VaultSetupWizardProps {
  busy?: boolean;
  error?: string | null;
  onSubmit: (password: string, options: VaultSetupOptions) => Promise<void>;
}

const STEPS = ["Welcome", "Password", "Recovery", "Preferences"] as const;

export function VaultSetupWizard({ busy = false, error, onSubmit }: VaultSetupWizardProps) {
  const [step, setStep] = useState(0);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [useRecovery, setUseRecovery] = useState(true);
  const [questionPreset, setQuestionPreset] = useState<string>(RECOVERY_QUESTION_PRESETS[0]);
  const [customQuestion, setCustomQuestion] = useState("");
  const [recoveryAnswer, setRecoveryAnswer] = useState("");
  const [autoLockMinutes, setAutoLockMinutes] = useState<AutoLockMinutes>(15);
  const [fieldPickerEnabled, setFieldPickerEnabled] = useState(true);
  const [openProfilesAfter, setOpenProfilesAfter] = useState(true);

  const displayError = localError ?? error ?? null;
  const recoveryQuestion =
    questionPreset === "custom" ? customQuestion.trim() : questionPreset;

  function next() {
    setLocalError(null);
    if (step === 1) {
      if (password.length < 8) {
        setLocalError("Password must be at least 8 characters");
        return;
      }
      if (password !== confirm) {
        setLocalError("Passwords do not match");
        return;
      }
    }
    if (step === 2 && useRecovery) {
      if (recoveryQuestion.length < 5) {
        setLocalError("Pick or enter a recovery question");
        return;
      }
      if (recoveryAnswer.trim().length < 3) {
        setLocalError("Recovery answer must be at least 3 characters");
        return;
      }
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setLocalError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function finish() {
    setLocalError(null);
    const options: VaultSetupOptions = {
      settings: {
        autoLockMinutes,
        fieldPickerEnabled,
        contextMenuEnabled: false,
      },
      recovery: useRecovery
        ? { question: recoveryQuestion, answer: recoveryAnswer }
        : undefined,
    };
    await onSubmit(password, options);
    if (openProfilesAfter) {
      void chrome.runtime.openOptionsPage();
    }
  }

  return (
    <div className="mt-2 space-y-3">
      <div className="flex items-center justify-between text-[10px] text-perfil-muted">
        <span>
          Step {step + 1} of {STEPS.length}
        </span>
        <span>{STEPS[step]}</span>
      </div>

      {step === 0 && (
        <div className="space-y-2 text-[11px] leading-relaxed text-perfil-muted">
          <p className="text-perfil-text font-medium">Fill forms with your saved profiles</p>
          <ul className="list-inside list-disc space-y-1">
            <li>One encrypted vault on this device — no account</li>
            <li>Scan and fill job apps, checkout, contact forms</li>
            <li>Save form snapshots per page URL when you need them</li>
          </ul>
          <p>Next: choose a master password and optional recovery.</p>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-2">
          <Input
            label="Master password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            minLength={8}
            required
          />
          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-2">
          <CompactToggle
            checked={useRecovery}
            onChange={setUseRecovery}
            label="Set up recovery question"
            info="If you forget your master password, answer this question to set a new one. Answers are stored hashed on this device only."
          />
          {useRecovery && (
            <>
              <Select
                label="Question"
                value={questionPreset}
                onChange={(e) => setQuestionPreset(e.target.value)}
                options={[
                  ...RECOVERY_QUESTION_PRESETS.map((q) => ({ value: q, label: q })),
                  { value: "custom", label: "Write your own…" },
                ]}
              />
              {questionPreset === "custom" && (
                <Input
                  label="Your question"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="Something only you know"
                />
              )}
              <Input
                label="Your answer"
                type="password"
                autoComplete="off"
                value={recoveryAnswer}
                onChange={(e) => setRecoveryAnswer(e.target.value)}
                placeholder="Remember the exact spelling"
              />
              <p className="text-[10px] text-perfil-muted">
                Tip: answers are not case-sensitive. Export a backup in Settings when you can.
              </p>
            </>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-2">
          <Select
            label="Auto-lock after"
            value={String(autoLockMinutes)}
            onChange={(e) => setAutoLockMinutes(Number(e.target.value) as AutoLockMinutes)}
            options={[
              { value: "5", label: "5 minutes" },
              { value: "15", label: "15 minutes" },
              { value: "30", label: "30 minutes" },
              { value: "60", label: "1 hour" },
              { value: "0", label: "Never (while browser open)" },
            ]}
          />
          <CompactToggle
            checked={fieldPickerEnabled}
            onChange={setFieldPickerEnabled}
            label="Field picker on focus"
            info="When you focus an input, Perfil can offer matching profile fields to fill that one field."
          />
          <CompactToggle
            checked={openProfilesAfter}
            onChange={setOpenProfilesAfter}
            label="Open profile editor after setup"
            info="Opens the full options page so you can edit name, email, and address right away."
          />
        </div>
      )}

      {displayError && (
        <p className="text-[11px] text-perfil-danger" role="alert">
          {displayError}
        </p>
      )}

      <div className="flex gap-2">
        {step > 0 && (
          <Button type="button" variant="secondary" className="btn-compact flex-1" onClick={back}>
            Back
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button type="button" className="btn-compact flex-1" onClick={next}>
            Continue
          </Button>
        ) : (
          <Button
            type="button"
            className="btn-compact flex-1"
            disabled={busy}
            onClick={() => void finish()}
          >
            {busy ? "Creating…" : "Create vault"}
          </Button>
        )}
      </div>
    </div>
  );
}
