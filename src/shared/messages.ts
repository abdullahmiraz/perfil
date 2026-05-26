import type { MessageRequest, MessageResponse, MessageType } from "@/types/messages";
import type { VaultStatus } from "@/types/vault";

export type { MessageRequest, MessageResponse, MessageType } from "@/types/messages";

export function sendMessage<T extends MessageType>(
  request: Extract<MessageRequest, { type: T }>,
): Promise<MessageResponse<T>> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(request, (response: MessageResponse<T>) => {
      const err = chrome.runtime.lastError;
      if (err) {
        reject(new Error(err.message));
        return;
      }
      if (response === undefined) {
        reject(new Error("No response from extension background"));
        return;
      }
      resolve(response);
    });
  });
}

export async function getVaultStatus(): Promise<{
  status: VaultStatus;
  profileCount: number;
}> {
  return sendMessage({ type: "GET_STATUS" });
}
