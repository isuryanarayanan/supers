import { Cell, VideoContent, FileContent } from "@/types/post";
import { MarkdownCell } from "./markdown-cell";
import { ImageCell } from "./image-cell";
import { VideoCell } from "./video-cell";
import { FileCell } from "./file-cell";

interface PostCellProps {
  cell: Cell;
}

export function PostCell({ cell }: PostCellProps) {
  const parseContent = (content: string | object): object => {
    if (typeof content === 'string') {
      try {
        let parsed = content;
        
        // Handle multiple layers of JSON encoding by repeatedly parsing
        // until we get an object or can't parse anymore
        while (typeof parsed === 'string') {
          try {
            const newParsed = JSON.parse(parsed);
            if (typeof newParsed === 'string' && newParsed !== parsed) {
              parsed = newParsed;
            } else {
              // If we get an object or the string didn't change, we're done
              parsed = newParsed;
              break;
            }
          } catch (e) {
            // If we can't parse anymore, break out of the loop
            break;
          }
        }
        
        return typeof parsed === 'object' ? parsed : {};
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
