/** Normalize recovery answer for comparison (case/space insensitive). */
export function normalizeRecoveryAnswer(answer: string): string {
  return answer.trim().toLowerCase().replace(/\s+/g, " ");
}

export function recoveryAnswerVerifier(answer: string): string {
  return btoa(`perfil-recovery-v1:${normalizeRecoveryAnswer(answer)}`);
}

export const RECOVERY_QUESTION_PRESETS = [
  "What city were you born in?",
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "What was the model of your first car?",
  "What is the name of your favorite teacher?",
  "What street did you grow up on?",
] as const;

export function isRecoveryAnswerValid(answer: string): boolean {
  return normalizeRecoveryAnswer(answer).length >= 3;
}
