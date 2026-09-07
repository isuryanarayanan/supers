"use client";

import { useRef } from "react";
import { Bold, Code, Heading2, Italic, Link as LinkIcon, List } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const tools = [
  { label: "Heading", value: "## Heading", icon: Heading2 },
  { label: "Bold", value: "**Bold text**", icon: Bold },
  { label: "Italic", value: "*Italic text*", icon: Italic },
  { label: "Link", value: "[Link text](https://example.com)", icon: LinkIcon },
  { label: "List", value: "- Item", icon: List },
  { label: "Code", value: "```ts\n// code\n```", icon: Code },
];

export function MarkdownEditor({ value, onChange, className }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insert = (template: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = value.slice(0, start);
    const after = value.slice(end);
    const prefix = before && !before.endsWith("\n") ? "\n" : "";
    const suffix = after && !after.startsWith("\n") ? "\n" : "";
    const nextValue = `${before}${prefix}${template}${suffix}${after}`;
    const nextCursor = before.length + prefix.length + template.length;

    onChange(nextValue);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  };

  return (
    <div className={cn("overflow-hidden rounded-md border bg-background focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/15", className)}>
      <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/20 px-2 py-1.5" role="toolbar" aria-label="Markdown formatting">
        {tools.map(({ label, value: template, icon: Icon }) => (
          <Button
            key={label}
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground"
            onClick={() => insert(template)}
            title={label}
            aria-label={label}
          >
            <Icon className="h-3.5 w-3.5" />
          </Button>
        ))}
        <span className="ml-auto px-2 text-[11px] text-muted-foreground">Markdown</span>
      </div>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-72 resize-y rounded-none border-0 bg-transparent px-4 py-3 font-mono text-sm leading-6 shadow-none focus-visible:ring-0"
        placeholder="Write in Markdown…"
      />
    </div>
  );
}
