"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { highlightCode } from "@/lib/highlight-code";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export function CodeBlock({ code, language = "javascript", filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const normalizedLanguage = language.toLowerCase();
  const highlightedCode = highlightCode(code, normalizedLanguage);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <figure className="group/code my-8 overflow-hidden rounded-xl border border-white/10 bg-[#090909] shadow-2xl shadow-black/20">
      <figcaption className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.025] px-4 py-2.5">
        <div className="min-w-0 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-400">
          <span className="text-zinc-200">{filename || normalizedLanguage}</span>
        </div>
        <button
          type="button"
          onClick={copyCode}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-md border border-white/10 px-2.5 font-mono text-[11px] text-zinc-400 transition-colors",
            "hover:border-white/20 hover:bg-white/5 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          )}
          aria-label="Copy code"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </figcaption>
      <pre className="m-0 overflow-x-auto p-4 md:p-5 [scrollbar-color:theme(colors.zinc.700)_transparent]">
        <code
          className="block min-w-max font-mono text-[13px] leading-6 text-zinc-100 md:text-sm md:leading-7"
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
    </figure>
  );
}
