import { Cell, VideoContent, FileContent } from "@/types/post";
import { MarkdownCell } from "./markdown-cell";
import { ImageCell } from "./image-cell";
import { VideoCell } from "./video-cell";
import { FileCell } from "./file-cell";

interface PostCellProps {
  cell: Cell;
}

export function PostCell({ cell }: PostCellProps) {
  const parseContent = (content: any) => {
    if (typeof content === 'string') {
      try {
        return JSON.parse(content);
      } catch (error) {
        console.error('Failed to parse cell content:', error);
        return {};
      }
    }
    return content;
  };

  switch (cell.type) {
    case "markdown":
      return <MarkdownCell content={cell.content as string} />;
    case "image":
      const imageContent = parseContent(cell.content) as { url: string; alt: string };
      return <ImageCell content={imageContent} />;
    case "video":
      const videoContent = parseContent(cell.content) as VideoContent;
      return <VideoCell content={videoContent} />;
    case "file":
      const fileContent = parseContent(cell.content) as FileContent;
      return <FileCell {...fileContent} />;
    default:
      return null;
  }
}
