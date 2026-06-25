import { streamChat, type ChatMessage } from "@/lib/nvidia"
import { getNotebook } from "@/lib/store"
import { runCRAG } from "@/lib/rag/corrective-rag"
import { buildGenerationMessages } from "@/lib/rag/generate"

export const runtime = "nodejs"
export const maxDuration = 60

type Body = {
  notebookId?: string
  messages?: ChatMessage[]
}

/**
 * RAG Chat Route
 * Manages semantic retrieval and streaming LLM responses.
 */
export async function POST(req: Request) {
  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return new Response("Invalid JSON", { status: 400 })
  }

  const { notebookId, messages } = body
  if (!messages || messages.length === 0) {
    return new Response("messages is required", { status: 400 })
  }

  // 1) Find the notebook chunks.
  let chunks: any[] = []
  const clientNotebook = (body as any).notebook
  
  if (clientNotebook?.chunks) {
    chunks = clientNotebook.chunks
  } else if (notebookId) {
    const notebook = getNotebook(notebookId)
    if (notebook) {
      chunks = notebook.chunks
    }
  }

  // Only throw 404 if we are NOT using Qdrant and have no local chunks
  if (chunks.length === 0 && process.env.USE_QDRANT !== "true") {
    return new Response(
      JSON.stringify({
        error:
          "This notebook is no longer in memory on the server. Please re-upload your document.",
      }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    )
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user")
  if (!lastUser) {
    return new Response("No user message found", { status: 400 })
  }

  // 2) Run the Corrective RAG Pipeline
  let cragResult
  try {
    cragResult = await runCRAG(lastUser.content, chunks)
  } catch (err) {
    console.error("[crag] error:", err)
    const message = err instanceof Error ? err.message : "Unknown error"
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  const {
    rewrittenQuery,
    firstPassChunks,
    judgedChunks,
    retryPerformed,
    finalChunks,
  } = cragResult

  // 3) Build the generation prompt using history + final chunks
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role as "user" | "assistant" | "system",
    content: m.content,
  }))

  const llmMessages = buildGenerationMessages(history, rewrittenQuery, finalChunks)

  // 4) Build markdown metadata payload to render "impressive" steps before answer
  const metadataMarkdown = `✓ **Query rewritten**
Original: \`${lastUser.content}\`
↓
Rewritten: \`${rewrittenQuery}\`

────────────────────
**Retrieved**
${firstPassChunks.length > 0 ? firstPassChunks.map(i => `Chunk ${i}`).join(", ") : "None"}

────────────────────
**Judge**
${judgedChunks.length > 0 ? judgedChunks.map(c => `Chunk ${c.index} ${c.relevant ? "✔" : "✘"}`).join("\n") : "None"}

────────────────────
**Retry Performed**
${retryPerformed ? "Yes" : "No"}

────────────────────
**Final Chunks**
${finalChunks.length > 0 ? finalChunks.map(c => c.index).join(", ") : "None"}

────────────────────

`

  // 5) Stream the response
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const header = JSON.stringify({
          type: "sources",
          sources: finalChunks.map((c) => ({
            id: c.id,
            index: c.index,
            text: c.text,
            score: c.score,
          })),
        }) + "\n\n---\n\n"
        
        controller.enqueue(encoder.encode(header))

        for await (const delta of streamChat(llmMessages)) {
          controller.enqueue(encoder.encode(delta))
        }
      } catch (err) {
        console.error("[v0] streaming error:", err)
        const message = err instanceof Error ? err.message : "Unknown error"
        controller.enqueue(encoder.encode(`\n\n[error: ${message}]`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  })
}
