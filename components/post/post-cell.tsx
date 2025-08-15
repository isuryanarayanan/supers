import { Cell, VideoContent, FileContent } from "@/types/post";
import { MarkdownCell } from "./markdown-cell";
import { ImageCell } from "./image-cell";
import { VideoCell } from "./video-cell";
import { FileCell } from "./file-cell";

interface PostCellProps {
  cell: Cell;
}

export function PostCell({ cell }: PostCellProps) {
  switch (cell.type) {
    case "markdown":
      return <MarkdownCell content={cell.content as string} />;
    case "image":
      return (
        <ImageCell content={cell.content as { url: string; alt: string }} />
      );
    case "video":
      return <VideoCell content={cell.content as VideoContent} />;
    case "file":
      return <FileCell {...(cell.content as FileContent)} />;
    default:
      return null;
  }
}
