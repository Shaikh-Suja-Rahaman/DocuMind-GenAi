import { embed } from "@/lib/nvidia"
import { searchInChunks } from "@/lib/store"

export type RetrievedChunk = {
  id: string
  text: string
  index: number
  score: number
}

/**
 * Perform vector search on Qdrant (if enabled) or locally.
 */
export async function retrieveChunks(
  query: string, 
  localChunks: any[], 
  topK = 5
): Promise<RetrievedChunk[]> {
  const queryEmbedding = await embed(query, "query")
  let results: RetrievedChunk[] = []

  if (process.env.USE_QDRANT === "true") {
    try {
      const { searchQdrant } = await import("@/lib/qdrant-experiment")
      const qdrantResults = await searchQdrant(queryEmbedding, topK)
      results = qdrantResults.map((r: any) => ({
        id: r.id,
        text: r.payload.text,
        index: r.payload.index,
        score: r.score,
      }))
    } catch (qErr) {
      console.error("❌ Qdrant search failed, falling back to local:", qErr)
    }
  }

  if (results.length === 0 && localChunks.length > 0) {
    results = searchInChunks(localChunks, queryEmbedding, topK)
  }

  return results
}
