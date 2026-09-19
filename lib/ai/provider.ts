import OpenAI from "openai";

/**
 * Provider abstraction so agents never call `openai.*` directly. Swapping
 * or adding a model provider later means changing this file only.
 */

export interface TextGenOptions {
  system?: string;
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
}

export interface StreamChunk {
  delta: string;
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

/** Cheap/fast model — routing, planning, review, summaries. */
export const FAST_MODEL = "gpt-4o-mini";
/** Full-capability model — actual code/design generation. */
export const STRONG_MODEL = "gpt-4o";

function withSystem(opts: TextGenOptions) {
  return opts.system
    ? [{ role: "system" as const, content: opts.system }, ...opts.messages]
    : opts.messages;
}

export async function generateText(
  model: string,
  opts: TextGenOptions
): Promise<string> {
  const resp = await openai.chat.completions.create({
    model,
    messages: withSystem(opts),
    temperature: opts.temperature ?? 0.4,
    max_tokens: opts.maxTokens ?? 1000,
    ...(opts.json ? { response_format: { type: "json_object" as const } } : {}),
  });
  return resp.choices[0]?.message?.content?.trim() || "";
}

export async function* streamText(
  model: string,
  opts: TextGenOptions
): AsyncGenerator<StreamChunk> {
  const stream = await openai.chat.completions.create({
    model,
    messages: withSystem(opts),
    temperature: opts.temperature ?? 0.6,
    max_tokens: opts.maxTokens ?? 12000,
    stream: true,
  });
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content || "";
    if (delta) yield { delta };
  }
}
