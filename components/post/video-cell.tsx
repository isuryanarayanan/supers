"use client";

import { VideoContent } from "@/types/post";
import { useEffect, useRef, useState } from "react";

interface VideoCellProps {
  content: VideoContent;
}

export function VideoCell({ content }: VideoCellProps) {
  const [aspectRatio, setAspectRatio] = useState<string>("16/9"); // Default aspect ratio
  const videoRef = useRef<HTMLIFrameElement>(null);
  const { url, title, provider = getVideoProvider(url) } = content;

  // Extract video ID and embed URL
  const embedUrl = getEmbedUrl(url, provider);

  useEffect(() => {
    // Set aspect ratio based on provider (could be enhanced with actual video metadata)
    setAspectRatio(provider === "vimeo" ? "16/9" : "16/9");
  }, [provider]);

  return (
    <div className="w-full space-y-2">
      <div
        className="relative w-full overflow-hidden rounded-lg bg-muted"
        style={{ aspectRatio }}
      >
        <iframe
          ref={videoRef}
          src={embedUrl}
          title={title}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {title && <p className="text-sm text-muted-foreground">{title}</p>}
    </div>
  );
}

// Helper function to determine video provider from URL
function getVideoProvider(url: string): "youtube" | "vimeo" | "direct" {
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return "youtube";
  } else if (url.includes("vimeo.com")) {
    return "vimeo";
  } else {
    return "direct";
  }
}

// Helper function to convert standard URLs to embed URLs
function getEmbedUrl(
  url: string,
  provider: "youtube" | "vimeo" | "direct"
): string {
  if (provider === "youtube") {
    // Handle both youtube.com/watch?v=ID and youtu.be/ID formats
    const videoId = url.includes("youtube.com/watch")
      ? new URL(url).searchParams.get("v")
      : url.split("youtu.be/")[1]?.split(/[?&]/)[0];

    return `https://www.youtube-nocookie.com/embed/${videoId}`;
  } else if (provider === "vimeo") {
    const videoId = url.split("vimeo.com/")[1]?.split(/[?&]/)[0];
    return `https://player.vimeo.com/video/${videoId}`;
  } else {
    // For direct video URLs, return as is
    return url;
  }
}
