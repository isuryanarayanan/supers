"use client";

import { format } from "date-fns";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Post } from "@/types/post";
import { ThumbnailCell } from "./thumbnail-cell";

interface ProjectPostCardProps {
  post: Post;
  variant?: "default" | "compact";
}

export function ProjectPostCard({
  post,
  variant = "default",
}: ProjectPostCardProps) {
  const formattedDate = format(new Date(post.updatedAt), "MMM d, yyyy");
  const showThumbnail = variant === "default" && post.thumbnail;

  return (
    <Link
      href={`/post/${post.id}`}
      className="group block border-t border-border/70 py-6 transition-colors last:border-b hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <article
        className={
          showThumbnail
            ? "grid gap-5 sm:grid-cols-[minmax(0,1fr)_11rem] sm:items-start md:gap-8"
            : "grid gap-3 md:grid-cols-[140px_1fr_auto] md:items-start md:gap-6"
        }
      >
        {showThumbnail ? (
          <div className="min-w-0 space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Project · {formattedDate}
            </p>
            <ProjectDetails post={post} />
            <div className="sm:hidden">
              <ProjectAction />
            </div>
          </div>
        ) : (
          <>
            <time className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground md:pt-1">
              {formattedDate}
            </time>
            <ProjectDetails post={post} />
            <ProjectAction />
          </>
        )}

        {showThumbnail && (
          <div className="order-first sm:order-none">
            <ThumbnailCell
              content={post.thumbnail!}
              className="h-auto aspect-[16/10] rounded-md border border-border/60 grayscale transition-all duration-300 group-hover:border-foreground/20 group-hover:grayscale-0"
            />
            <div className="mt-3 hidden justify-end sm:flex">
              <ProjectAction />
            </div>
          </div>
        )}
      </article>
    </Link>
  );
}

function ProjectDetails({ post }: { post: Post }) {
  return (
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
  );
}

function ProjectAction() {
  return (
    <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground transition-colors group-hover:text-foreground md:pt-2">
      View
      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </div>
  );
}
