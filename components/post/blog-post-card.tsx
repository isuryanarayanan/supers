"use client";

import { Post } from "@/types/post";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface BlogPostCardProps {
  post: Post;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  const formattedDate = format(new Date(post.updatedAt), "MMM d, yyyy");

  return (
    <Link
      href={`/post/${post.id}`}
      className="group block border-t border-border/70 py-6 transition-colors last:border-b hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <article className="grid gap-3 md:grid-cols-[140px_1fr_auto] md:items-start md:gap-6">
        <time className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground md:pt-1">
          {formattedDate}
        </time>

        <div className="min-w-0 space-y-2">
          <h3 className="text-xl font-bold leading-tight tracking-[-0.025em] text-foreground transition-colors group-hover:text-foreground/80 md:text-2xl">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
              {post.excerpt}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground transition-colors group-hover:text-foreground md:pt-2">
          Read
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
      </article>
    </Link>
  );
}
