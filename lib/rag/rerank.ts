import { RetrievedChunk } from "./retrieve"

/**
 * Merge and rerank chunks based on frequency across multiple search passes.
 * If a chunk is found in multiple searches, it gets a higher rank.
 */
export function rerankChunks(searchPasses: RetrievedChunk[][], topK = 5): RetrievedChunk[] {
  const frequencyMap = new Map<number, { chunk: RetrievedChunk; count: number }>()

  for (const pass of searchPasses) {
    for (const chunk of pass) {
      if (frequencyMap.has(chunk.index)) {
        frequencyMap.get(chunk.index)!.count += 1
      } else {
        frequencyMap.set(chunk.index, { chunk, count: 1 })
      }
    }
  }

  // Sort by frequency (descending), then by original score (descending)
  const sorted = Array.from(frequencyMap.values()).sort((a, b) => {
    if (a.count !== b.count) {
      return b.count - a.count
    }
    return b.chunk.score - a.chunk.score
  })

  return sorted.slice(0, topK).map(item => item.chunk)
}
