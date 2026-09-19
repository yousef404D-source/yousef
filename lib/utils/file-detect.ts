export interface DetectedFile {
  language: string;
  suggestedFilename: string;
}

const SIGNATURES: { test: (s: string) => boolean; language: string; ext: string }[] = [
  { test: (s) => /"use client"|"use server"/.test(s) || /from ["']next\//.test(s), language: "Next.js / TypeScript", ext: "tsx" },
  { test: (s) => /import\s+.*from\s+["']react["']/.test(s), language: "React", ext: "tsx" },
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

const MIN_CHARS_FOR_FILE_CARD = 400;
const MIN_LINES_FOR_FILE_CARD = 15;

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
