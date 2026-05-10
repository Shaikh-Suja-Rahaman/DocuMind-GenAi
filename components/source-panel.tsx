"use client"

import { useRef, useState } from "react"
import { FileText, Loader2, Trash2, Upload, Cpu, Zap, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Notebook } from "@/lib/types"

type Props = {
  notebook: Notebook | null
  onUploaded: (nb: Notebook) => void
  onClear: () => void
}

export function SourcePanel({ notebook, onUploaded, onClear }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  async function handleFile(file: File) {
    setError(null)
    setIsUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? "Upload failed")
      onUploaded(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed"
      setError(message)
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-transparent">
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
            <Cpu className="h-4 w-4" />
          </div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">Knowledge Base</h2>
        </div>
        {notebook && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            onClick={onClear}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {!notebook ? (
          <label
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={cn(
              "group relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-10 text-center transition-all duration-200",
              isDragging
                ? "border-zinc-400 dark:border-zinc-500 bg-zinc-50 dark:bg-zinc-900 scale-[1.02]"
                : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/50",
              isUploading && "pointer-events-none opacity-60",
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.txt,.md,.csv,application/pdf,text/plain,text/markdown,text/csv"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFile(f)
              }}
            />
            {isUploading ? (
              <div className="flex flex-col items-center gap-4 relative overflow-hidden w-full h-full">
                <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-900 pointer-events-none border-t border-zinc-200 dark:border-zinc-800" />
                <div className="relative mt-10">
                  <Loader2 className="h-8 w-8 animate-spin text-zinc-950 dark:text-zinc-50 relative" />
                </div>
                <div className="space-y-1 relative">
                  <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Processing Document...</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Extracting content</div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 shadow-sm group-hover:shadow-md transition-all duration-200">
                  <Upload className="h-5 w-5 text-zinc-500 group-hover:text-zinc-950 dark:group-hover:text-zinc-50 transition-colors" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50 transition-colors">Upload Document</div>
                  <p className="text-[10px] text-zinc-500 font-medium px-4">
                    PDF, CSV, or TXT. Maximum 20MB.
                  </p>
                </div>
              </>
            )}
          </label>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
            {/* Document Module */}
            <div className="relative group">
              <div className="relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] p-4 shadow-sm transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-zinc-950 dark:text-zinc-50 mb-1" title={notebook.name}>
                      {notebook.name}
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                         {notebook.chunkCount} Chunks Extracted
                       </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pipeline Badge */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 p-4 space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                 <Zap className="h-3 w-3 text-zinc-400" />
                 Local Pipeline Active
              </div>
              <div className="space-y-2">
                 <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Embedding Engine</span>
                    <span className="text-[10px] font-mono text-zinc-500">in-memory</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Vector Storage</span>
                    <span className="text-[10px] font-mono text-zinc-500">local</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Chunk Density</span>
                    <span className="text-[10px] font-mono text-zinc-500">~900 chars</span>
                 </div>
              </div>
              <div className="pt-2 flex items-center gap-2 text-[10px] text-emerald-500/70 font-bold italic">
                 <ShieldCheck className="h-3 w-3" />
                 Grounding Logic Active
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-400 font-medium animate-in shake-1">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
