import { rewriteQuery } from "./rewrite-query"
import { retrieveChunks, RetrievedChunk } from "./retrieve"
import { judgeChunks } from "./judge"
import { rerankChunks } from "./rerank"

export type CRAGResult = {
  originalQuery: string
  rewrittenQuery: string
  firstPassChunks: number[]
  judgedChunks: { index: number; relevant: boolean }[]
  retryPerformed: boolean
  finalChunks: RetrievedChunk[]
}

const RETRY_REWRITE_PROMPT = `The previous retrieval failed to find enough relevant context.

Original Query:
{query}

Irrelevant chunks:
{irrelevant_chunks}

Rewrite the query to improve retrieval. Focus on different keywords or a broader conceptual search.
CRITICAL: Return ONLY the rewritten query text. Do NOT add conversational filler or greetings.`

export async function runCRAG(originalQuery: string, localChunks: any[]): Promise<CRAGResult> {
  // Phase 1: Initial Query Rewriting
  const rewrittenQuery = await rewriteQuery(originalQuery)
  
  // Phase 2: First Retrieval
  const firstPass = await retrieveChunks(rewrittenQuery, localChunks)
  const firstPassChunks = firstPass.map(c => c.index)

  // Phase 3: Judge Chunks
  const judged = await judgeChunks(rewrittenQuery, firstPass)
  const relevantChunks = judged.filter(c => c.relevant)
  const irrelevantChunks = judged.filter(c => !c.relevant)

  const judgedChunksMetadata = judged.map(c => ({ index: c.index, relevant: c.relevant }))

  // Always start with the full firstPass as a baseline so we never end up with empty context.
  // The relevantChunks are a filtered subset; if the judge is too strict and kills everything
  // we still have something to pass to the main LLM.
  let searchPasses: typeof firstPass[] = [firstPass]
  let retryPerformed = false

  // Phase 4: Retry Retrieval if needed (less than half relevant)
  if (relevantChunks.length < firstPass.length / 2 && irrelevantChunks.length > 0) {
    retryPerformed = true
    
    const irrelevantText = irrelevantChunks.map(c => c.text).join("\n\n")
    const retryPrompt = RETRY_REWRITE_PROMPT
      .replace("{query}", originalQuery)
      .replace("{irrelevant_chunks}", irrelevantText)

    const { chat, SMALL_CHAT_MODEL } = await import("@/lib/nvidia")
    const secondRewrittenQuery = await chat([
      { role: "system", content: "You are a query rewriting assistant trying to fix a failed search." },
      { role: "user", content: retryPrompt }
    ], SMALL_CHAT_MODEL, 100)

    const secondPass = await retrieveChunks(secondRewrittenQuery.trim(), localChunks)
    searchPasses.push(secondPass)
  }

  // Phase 5 & 6: Merge and Rerank across all passes
  const finalChunks = rerankChunks(searchPasses, 5)

  return {
    originalQuery,
    rewrittenQuery,
    firstPassChunks,
    judgedChunks: judgedChunksMetadata,
    retryPerformed,
    finalChunks
  }
}
