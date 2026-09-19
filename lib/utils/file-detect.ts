export interface DetectedFile {
  language: string;
  suggestedFilename: string;
}

const MIN_CHARS_FOR_FILE_CARD = 400;
const MIN_LINES_FOR_FILE_CARD = 15;

/**
 * Next.js gets a dedicated multi-signal scorer rather than a single regex,
 * per the requirement that detection "should consider next.config.*, app/,
 * pages/, Next.js routing, use client, React Server Components, Next.js
 * APIs, Server Actions, package.json" and NOT blindly classify unrelated
 * code as Next.js just because it imports something from "next/*".
 */
function scoreNextJs(s: string): number {
  let score = 0;
  if (/^["']use client["'];?/m.test(s) || /^["']use server["'];?/m.test(s)) score += 2;
  if (/from ["']next\/(navigation|link|image|font|headers|server)["']/.test(s)) score += 2;
  if (/export\s+(default\s+)?async function\s+(GET|POST|PUT|PATCH|DELETE)\s*\(/.test(s)) score += 2; // Route Handler
  if (/export\s+const\s+(metadata|revalidate|dynamic|runtime)\s*=/.test(s)) score += 2; // App Router conventions
  if (/next\.config\.(js|ts|mjs)/.test(s)) score += 2;
  if (/\bapp\/(layout|page|loading|error|not-found)\.(tsx|ts|jsx|js)\b/.test(s)) score += 2;
  if (/\bpages\/(_app|_document|api)\b/.test(s)) score += 1;
  if (/"next":\s*"[\^~]?[\d.]/.test(s)) score += 2; // package.json dependency
  if (/from ["']next["']/.test(s)) score += 1;
  return score;
}

const SIGNATURES: { test: (s: string) => boolean; language: string; ext: string }[] = [
  { test: (s) => scoreNextJs(s) >= 2, language: "Next.js / TypeScript", ext: "tsx" },
  { test: (s) => /import\s+.*from\s+["']react["']/.test(s) || /<[A-Z]\w*[\s/>]/.test(s), language: "React", ext: "tsx" },
  { test: (s) => /interface\s+\w+|:\s*(string|number|boolean)\[?\]?\s*[;,)=]/.test(s) && /import|export/.test(s), language: "TypeScript", ext: "ts" },
  { test: (s) => /def\s+\w+\(|import\s+\w+\n/.test(s) && /:\s*$/m.test(s), language: "Python", ext: "py" },
  { test: (s) => /<!DOCTYPE html>|<html[\s>]/i.test(s), language: "HTML", ext: "html" },
  { test: (s) => /^\s*[.#]?[\w-]+\s*\{[\s\S]*\}/.test(s) && /:\s*[\w#%.-]+;/.test(s), language: "CSS", ext: "css" },
  { test: (s) => /^\s*[{[]/.test(s.trim()) && (() => { try { JSON.parse(s); return true; } catch { return false; } })(), language: "JSON", ext: "json" },
  { test: (s) => /^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE TABLE)\b/im.test(s), language: "SQL", ext: "sql" },
  { test: (s) => /^[\w.-]+:\s*$/m.test(s) && /^\s{2}[\w.-]+:/m.test(s), language: "YAML", ext: "yaml" },
  { test: (s) => /^#{1,6}\s+/m.test(s) && /\n\n/.test(s), language: "Markdown", ext: "md" },
  { test: (s) => /at\s+.+\(.+:\d+:\d+\)|Traceback \(most recent call last\)/.test(s), language: "Log / Stack trace", ext: "log" },
  { test: (s) => /import\s+.*from\s+["'][./]/.test(s) || /function\s+\w+\(|const\s+\w+\s*=/.test(s), language: "JavaScript", ext: "js" },
];

/**
 * Decides whether a pasted block of text is "file-like" content that should
 * become a compact attachment card instead of a giant chat bubble.
 */
export function detectPastedFile(text: string): DetectedFile | null {
  const lineCount = text.split("\n").length;
  if (text.length < MIN_CHARS_FOR_FILE_CARD || lineCount < MIN_LINES_FOR_FILE_CARD) {
    return null;
  }

  for (const sig of SIGNATURES) {
    if (sig.test(text)) {
      return { language: sig.language, suggestedFilename: `pasted.${sig.ext}` };
    }
  }

  // Long + line-heavy but no signature matched — still likely code/config,
  // just unrecognized. Treat as a generic file rather than dumping it inline.
  return { language: "Text file", suggestedFilename: "pasted.txt" };
}
