"use client"

import { useState } from "react"
import { Bot, User, Quote, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ChatMessage as ChatMessageType, Source } from "@/lib/types"

type Props = {
  message: ChatMessageType
}

export function ChatMessageItem({ message }: Props) {
  const [activeChunk, setActiveChunk] = useState<number | null>(null)
  const isUser = message.role === "user"

  const rendered = isUser
    ? message.content
    : renderWithCitations(message.content, message.sources ?? [], (idx) =>
        setActiveChunk((prev) => (prev === idx ? null : idx)),
      )

  return (
    <div className={cn(
      "group relative flex flex-col gap-4 animate-message",
      isUser ? "items-end" : "items-start"
    )}>
      <div
        className={cn(
          "flex items-start gap-4 max-w-[90%] md:max-w-[80%]",
          isUser ? "flex-row-reverse" : "flex-row",
        )}
      >
        {/* Avatar with Glow */}
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm border",
            isUser
              ? "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
              : "bg-zinc-950 dark:bg-zinc-50 border-zinc-950 dark:border-zinc-50 text-white dark:text-zinc-950",
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>

        {/* Message Bubble */}
        <div
          className={cn(
            "relative flex flex-col gap-2 rounded-xl px-4 py-3 text-sm leading-relaxed shadow-sm transition-all",
            isUser
              ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 font-medium rounded-tr-none border border-zinc-200 dark:border-zinc-800"
              : "bg-white dark:bg-[#0a0a0a] text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-tl-none",
          )}
        >
          {!isUser && (
             <div className="flex items-center gap-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
               <span className="text-zinc-500">System</span>
               <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
               <span>Response</span>
             </div>
          )}

          {message.pending && !message.content ? (
            <div className="flex items-center gap-1.5 py-2">
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 dark:bg-zinc-600 [animation-duration:1s]" />
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 dark:bg-zinc-600 [animation-duration:1s] [animation-delay:0.2s]" />
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 dark:bg-zinc-600 [animation-duration:1s] [animation-delay:0.4s]" />
            </div>
          ) : (
            <div className={cn(
              "whitespace-pre-wrap text-pretty",
              isUser 
                ? "font-sans text-[14px] font-medium tracking-tight leading-relaxed" 
                : "font-serif text-[15px] md:text-[16px] leading-[1.7] tracking-normal text-zinc-800 dark:text-zinc-200"
            )}>
              {rendered}
            </div>
          )}
        </div>
      </div>

      {/* Citation Preview with Glass Effect */}
      {!isUser && activeChunk !== null && message.sources && (
        <div className="animate-in slide-in-from-top-2 fade-in duration-300 w-full max-w-2xl ml-13">
          <SourcePreview
            source={message.sources.find((s) => s.index === activeChunk)}
            onClose={() => setActiveChunk(null)}
          />
        </div>
      )}
    </div>
  )
}

function renderWithCitations(
  text: string,
  sources: Source[],
  onClick: (idx: number) => void,
): React.ReactNode {
  if (sources.length === 0) return text

  const validIndices = new Set(sources.map((s) => s.index))
  const regex = /\[((?:\d+\s*,\s*)*\d+)\]/g

  const out: React.ReactNode[] = []
  let lastEnd = 0
  let key = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastEnd) {
      out.push(text.slice(lastEnd, match.index))
    }
    const nums = match[1]
      .split(",")
      .map((n) => Number.parseInt(n.trim(), 10))
      .filter((n) => Number.isFinite(n))

    out.push(
      <span key={`cite-${key++}`} className="inline-flex items-center gap-1 mx-1 translate-y-[-1px]">
        {nums.map((n, i) => {
          const valid = validIndices.has(n)
          return (
            <button
              key={`${n}-${i}`}
              type="button"
              onClick={() => valid && onClick(n)}
              disabled={!valid}
              className={cn(
                "inline-flex h-4 min-w-[16px] items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-1 font-mono text-[9px] font-semibold transition-colors",
                valid
                  ? "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-950 dark:hover:text-zinc-50 cursor-pointer"
                  : "text-zinc-400 dark:text-zinc-600 cursor-default opacity-50",
              )}
              title={valid ? `View Evidence: Chunk ${n}` : `Metadata Ref ${n}`}
            >
              {n}
            </button>
          )
        })}
      </span>,
    )
    lastEnd = match.index + match[0].length
  }
  if (lastEnd < text.length) out.push(text.slice(lastEnd))
  return out
}

function SourcePreview({
  source,
  onClose,
}: {
  source: Source | undefined
  onClose: () => void
}) {
  if (!source) return null
  return (
    <div className="relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] p-4 shadow-md group/source overflow-hidden">
      <div className="absolute top-0 right-0 p-2">
         <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
        >
          <ChevronRight className="h-4 w-4 rotate-90 md:rotate-0" />
        </button>
      </div>
      
      <div className="flex items-center gap-3 mb-3">
        <div className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
           <Quote className="h-3 w-3 text-zinc-500" />
        </div>
        <div className="flex flex-col">
           <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-950 dark:text-zinc-50">Source Evidence #{source.index}</span>
           <span className="text-[10px] text-zinc-500">{(source.score * 100).toFixed(1)}% Relevance</span>
        </div>
      </div>

      <div className="max-h-60 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 custom-scrollbar pr-2 italic">
        "{source.text}"
      </div>
    </div>
  )
}
