"use client";

import { Post } from "@/types/post";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ThumbnailCell } from "./thumbnail-cell";
import { formatDistance } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRef, useEffect } from "react";

interface ProjectPostCardProps {
  post: Post;
  variant?: "default" | "compact";
}

function getPreviewContent(post: Post) {
  const markdownCell = post.cells.find((cell) => cell.type === "markdown");
  if (!markdownCell) return "";

  const content = markdownCell.content as string;
  const words = content.split(" ");
  return words.slice(0, 50).join(" ") + (words.length > 50 ? "..." : "");
}

export function ProjectPostCard({
  post,
  variant = "default",
}: ProjectPostCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isHovering = useRef(false);
  const formattedDate = formatDistance(new Date(post.updatedAt), new Date(), {
    addSuffix: true,
  });
  const previewContent = getPreviewContent(post);
  const isCompact = variant === "compact";

  useEffect(() => {
    const cardElement = cardRef.current;
    if (!cardElement) return;

    let scrollTimeout: NodeJS.Timeout | null = null;

    const handleMouseEnter = () => {
      if (isHovering.current) return;
      isHovering.current = true;

      window.dispatchEvent(
        new CustomEvent("cardHover", {
          detail: { type: "leave" },
        })
      );

      setTimeout(() => {
        const rect = cardElement.getBoundingClientRect();
        const scrollX =
          window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY =
          window.pageYOffset || document.documentElement.scrollTop;

        window.dispatchEvent(
          new CustomEvent("cardHover", {
            detail: {
              type: "enter",
              cardId: post.id,
              bounds: {
                left: rect.left + scrollX,
                top: rect.top + scrollY,
                right: rect.right + scrollX,
                bottom: rect.bottom + scrollY,
                width: rect.width,
                height: rect.height,
              },
            },
          })
        );
      }, 10);
    };

    const handleMouseLeave = () => {
      isHovering.current = false;
      window.dispatchEvent(
        new CustomEvent("cardHover", {
          detail: {
            type: "leave",
            cardId: post.id,
          },
        })
      );
    };

    const handleScroll = () => {
      if (!isHovering.current) return;

      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      scrollTimeout = setTimeout(() => {
        if (!isHovering.current) return;

        const rect = cardElement.getBoundingClientRect();
        const isInViewport =
          rect.top < window.innerHeight &&
          rect.bottom > 0 &&
          rect.left < window.innerWidth &&
          rect.right > 0;

        if (!isInViewport) {
          isHovering.current = false;
          window.dispatchEvent(
            new CustomEvent("cardHover", {
              detail: {
                type: "leave",
                cardId: post.id,
              },
            })
          );
        } else {
          const scrollX =
            window.pageXOffset || document.documentElement.scrollLeft;
          const scrollY =
            window.pageYOffset || document.documentElement.scrollTop;

          window.dispatchEvent(
            new CustomEvent("cardHover", {
              detail: {
                type: "update",
                cardId: post.id,
                bounds: {
                  left: rect.left + scrollX,
                  top: rect.top + scrollY,
                  right: rect.right + scrollX,
                  bottom: rect.bottom + scrollY,
                  width: rect.width,
                  height: rect.height,
                },
              },
            })
          );
        }
      }, 16);
    };

    cardElement.addEventListener("mouseenter", handleMouseEnter);
    cardElement.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      if (isHovering.current) {
        window.dispatchEvent(
          new CustomEvent("cardHover", {
            detail: {
              type: "leave",
              cardId: post.id,
            },
          })
        );
      }
      cardElement.removeEventListener("mouseenter", handleMouseEnter);
      cardElement.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [post.id]);

  return (
    <Card
      ref={cardRef}
      className="w-full transition-all duration-500 hover:shadow-md dark:hover:shadow-primary/5 hover:scale-[1.005] transform-gpu"
    >
      <Link href={`/post/${post.id}`} className="block">
        <CardContent className="px-4 py-3 md:px-5 md:py-4 flex flex-col h-full min-h-[200px]">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="space-y-1 flex-1">
              <CardTitle className="transition-colors hover:text-primary text-xl font-bold leading-tight">
                {post.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground font-medium">
                {formattedDate}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="group font-medium flex-shrink-0"
            >
              Read more{" "}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          {post.thumbnail && (
            <div className="mt-3 flex-shrink-0">
              <ThumbnailCell
                content={post.thumbnail}
                className={isCompact ? "h-48" : "h-64 md:h-72"}
              />
            </div>
          )}

          {!isCompact && previewContent && (
            <div className={post.thumbnail ? "mt-3" : "mt-1"}>
              <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                {previewContent}
              </p>
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}
