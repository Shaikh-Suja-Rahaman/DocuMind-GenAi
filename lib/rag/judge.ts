import { chat, SMALL_CHAT_MODEL } from "@/lib/nvidia"
import { RetrievedChunk } from "./retrieve"

export type JudgedChunk = RetrievedChunk & { relevant: boolean }

const JUDGE_PROMPT = `You are a strict relevance judge.
Given a user query and a retrieved context chunk, determine if the chunk is relevant to answering the query.
Reply only "YES" or "NO".`

export async function judgeChunks(query: string, chunks: RetrievedChunk[]): Promise<JudgedChunk[]> {
  const promises = chunks.map(async (chunk) => {
    try {
      const response = await chat([
        { role: "system", content: JUDGE_PROMPT },
        { role: "user", content: `User Query:\n${query}\n\nRetrieved Context:\n${chunk.text}` }
      ], SMALL_CHAT_MODEL, 10)
      
      const isRelevant = response.trim().toUpperCase().includes("YES")
      return { ...chunk, relevant: isRelevant }
    } catch (err) {
      console.error(`Error judging chunk ${chunk.index}:`, err)
      // On error, default to relevant so we don't drop context unnecessarily
      return { ...chunk, relevant: true }
    }
  })

  return Promise.all(promises)
}
