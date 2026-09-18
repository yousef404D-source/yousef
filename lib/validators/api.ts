/**
 * Small hand-rolled validators for API route bodies.
 *
 * We deliberately avoid adding a new dependency (e.g. zod) here since it's
 * not already in package.json — feel free to swap these for zod schemas
 * later (`npm install zod`) if the project's validation needs grow.
 */

export class ValidationError extends Error {}

const MAX_PROMPT_LENGTH = 8000;
const MAX_MESSAGES = 50;
// Full generated site documents (HTML + inline Tailwind/JS) can legitimately
// run large — this caps it well above anything gpt-4o would realistically
// produce in one response, as a sanity/DoS guard rather than a real limit.
const MAX_CODE_LENGTH = 400000;

export interface ChatMessageInput {
  sender: "user" | "assistant";
  text: string;
  /** The full generated site HTML attached to this assistant turn, if any.
   * Only the caller's LAST such value is actually forwarded to the model
   * (see app/api/nova/route.ts) so edits target the current site instead
   * of every historical version bloating the prompt. */
  codeBlock?: string;
}

export function validateChatRequest(body: unknown): {
  messages: ChatMessageInput[];
  conversationId?: string;
} {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("Request body must be an object");
  }

  const { messages, conversationId } = body as Record<string, unknown>;

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new ValidationError("`messages` must be a non-empty array");
  }
  if (messages.length > MAX_MESSAGES) {
    throw new ValidationError(`Too many messages (max ${MAX_MESSAGES})`);
  }

  const cleaned: ChatMessageInput[] = messages.map((m, i) => {
    if (typeof m !== "object" || m === null) {
      throw new ValidationError(`messages[${i}] must be an object`);
    }
    const { sender, text, codeBlock } = m as Record<string, unknown>;
    if (sender !== "user" && sender !== "assistant") {
      throw new ValidationError(`messages[${i}].sender must be "user" or "assistant"`);
    }
    if (typeof text !== "string" || text.length === 0) {
      throw new ValidationError(`messages[${i}].text must be a non-empty string`);
    }
    if (text.length > MAX_PROMPT_LENGTH) {
      throw new ValidationError(
        `messages[${i}].text exceeds max length of ${MAX_PROMPT_LENGTH} characters`
      );
    }
    if (codeBlock !== undefined) {
      if (typeof codeBlock !== "string") {
        throw new ValidationError(`messages[${i}].codeBlock must be a string`);
      }
      if (codeBlock.length > MAX_CODE_LENGTH) {
        throw new ValidationError(`messages[${i}].codeBlock exceeds max length`);
      }
    }
    return { sender, text, codeBlock: codeBlock as string | undefined };
  });

  if (conversationId !== undefined && typeof conversationId !== "string") {
    throw new ValidationError("`conversationId` must be a string");
  }

  return { messages: cleaned, conversationId: conversationId as string | undefined };
}

export function validateDeployRequest(body: unknown): {
  code: string;
  conversationId?: string;
} {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("Request body must be an object");
  }
  const { code, conversationId } = body as Record<string, unknown>;

  if (typeof code !== "string" || code.trim().length === 0) {
    throw new ValidationError("`code` must be a non-empty string");
  }
  if (code.length > MAX_CODE_LENGTH) {
    throw new ValidationError(`\`code\` exceeds max length of ${MAX_CODE_LENGTH} characters`);
  }
  if (conversationId !== undefined && typeof conversationId !== "string") {
    throw new ValidationError("`conversationId` must be a string");
  }

  return { code: code.trim(), conversationId: conversationId as string | undefined };
}
