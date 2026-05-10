"use client"

import { useState } from "react"
import { BookOpen, Menu, X, Github, ExternalLink, Sparkles } from "lucide-react"
import { ChatPanel } from "@/components/chat-panel"
import { SourcePanel } from "@/components/source-panel"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Notebook } from "@/lib/types"

/**
 * Premium Notebook App Shell
 * Developed by Suja Rahaman
 */
export function NotebookApp() {
  const [notebook, setNotebook] = useState<Notebook | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex h-dvh flex-col bg-white dark:bg-[#0a0a0a] text-zinc-950 dark:text-zinc-50 selection:bg-zinc-200 dark:selection:bg-zinc-800 overflow-hidden font-sans">
      {/* Top Header - Minimalist */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md px-4 z-50">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 md:hidden text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-sm">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight leading-none">DocuMind</span>
            <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest mt-1">Workspace</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
            <span className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Local Instance</span>
          </div>
        </div>
      </header>

      <main className="relative flex flex-1 overflow-hidden min-h-0">
        {/* Mobile Sidebar Overlay */}
        <div 
          className={cn(
            "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity md:hidden",
            isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
          )}
          onClick={() => setIsSidebarOpen(false)}
        />
        
        {/* Sidebar Panel */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-40 w-[300px] transform bg-zinc-50 dark:bg-[#0a0a0a] border-r border-zinc-200 dark:border-zinc-800 transition-transform duration-300 md:relative md:z-0 md:w-[320px] md:translate-x-0 lg:w-[360px]",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
               <SourcePanel
                notebook={notebook}
                onUploaded={(nb) => {
                  setNotebook(nb)
                  setIsSidebarOpen(false) 
                }}
                onClear={() => setNotebook(null)}
              />
            </div>
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Settings</span>
                <span className="text-[10px] text-zinc-500 font-medium">Suja Rahaman</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area - Minimalist */}
        <div className="flex-1 relative flex flex-col min-w-0 bg-white dark:bg-[#0a0a0a]">
          <div className="flex-1 overflow-hidden flex flex-col">
            <ChatPanel notebook={notebook} />
          </div>
        </div>
      </main>
    </div>
  )
}
