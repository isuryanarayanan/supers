"use client";

import Image from "next/image";

interface ImageCellProps {
  content: {
    url: string;
    alt: string;
  };
}

export function ImageCell({ content }: ImageCellProps) {
  // Don't render if URL is empty or invalid
  if (!content?.url || content.url.trim() === '') {
    return null;
  }

  return (
    <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg">
      <Image
        src={content.url}
        alt={content.alt || ''}
        fill
        className="object-cover"
        sizes="(min-width: 1280px) 1200px, (min-width: 780px) 720px, 100vw"
      />
    </div>
  );
}
