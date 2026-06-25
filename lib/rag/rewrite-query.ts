import { chat, SMALL_CHAT_MODEL } from "@/lib/nvidia"

const REWRITE_PROMPT = `You are an expert query rewriting assistant. Your ONLY job is to rewrite the given user query to improve document retrieval.

Instructions:
- Fix any spelling mistakes.
- Expand acronyms and abbreviations.
- Add missing technical context if obvious.
- Preserve the exact original intent.
- Do NOT answer the question.
- Do NOT add conversational filler like "Here is the rewritten query" or "To better assist you".
- If the query is just a greeting like "hello" or "hi", leave it exactly as is.

CRITICAL: Return ONLY the rewritten query text. Nothing else.`

export async function rewriteQuery(query: string): Promise<string> {
  const rewritten = await chat([
    { role: "system", content: REWRITE_PROMPT },
    { role: "user", content: `Query: ${query}\n\nRewritten:` }
  ], SMALL_CHAT_MODEL, 100)

  return rewritten.trim()
}
