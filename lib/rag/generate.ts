import { ChatMessage } from "@/lib/nvidia"
import { RetrievedChunk } from "./retrieve"

export const CRAG_SYSTEM_PROMPT = `You are a helpful and intelligent research assistant.

Rules:
1. For general greetings (like "hi", "hey") or conversational pleasantries, respond naturally and politely.
2. When answering questions about the provided documents, use ONLY the supplied document excerpts. Do not use outside knowledge.
3. Always cite the chunk IDs you use with bracketed numbers like [1], [3]. The numbers refer to the "Chunk N" labels.
4. If the user asks a question about the document but the provided excerpts do not contain the answer, politely inform the user that the information is not present in the provided context. Do not guess or hallucinate.`

export function buildContext(chunks: RetrievedChunk[]): string {
  return chunks
    .map((r) => `Chunk ${r.index} (relevance ${r.score.toFixed(3)}):\n${r.text}`)
    .join("\n\n---\n\n")
}

export function buildGenerationMessages(
  history: ChatMessage[],
  query: string,
  chunks: RetrievedChunk[]
): ChatMessage[] {
  const context = buildContext(chunks)
  return [
    { role: "system", content: CRAG_SYSTEM_PROMPT },
    ...history,
    {
      role: "user",
      content: `Document excerpts:\n\n${context}\n\n---\n\nQuestion: ${query}\n\nAnswer using only the excerpts above. Cite chunks like [N].`,
    },
  ]
}
