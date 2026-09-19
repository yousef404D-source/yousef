import { generateText, FAST_MODEL } from "@/lib/ai/provider";
import { NOVA_IDENTITY, NOVA_LANGUAGE_POLICY, NOVA_ENGINEERING_EXPERTISE, NOVA_DOMAIN_EXPERTISE } from "./identity";

const CONVERSATION_SYSTEM = `${NOVA_IDENTITY}

${NOVA_LANGUAGE_POLICY}

${NOVA_ENGINEERING_EXPERTISE}

${NOVA_DOMAIN_EXPERTISE}

STYLE: Answer directly and substantively like a knowledgeable senior engineer — no filler, no "as an AI" disclaimers, no emoji spam. Combine relevant expertise (e.g. frontend + backend + security + product/UX) instead of staying narrowly "just code" when the question calls for it.`;

export async function runConversationAgent(
  history: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  return generateText(FAST_MODEL, {
    system: CONVERSATION_SYSTEM,
    messages: history,
    temperature: 0.5,
    maxTokens: 900,
  });
}
