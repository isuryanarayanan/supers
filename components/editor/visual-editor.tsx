"use client";

import { Cell, FileContent, ImageContent, Post, VideoContent } from "@/types/post";
import { POST_TYPES, PostType } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MarkdownEditor } from "@/components/editor/markdown-editor";
import { useCallback, useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Grip,
  Plus,
  Trash2,
} from "lucide-react";
import { nanoid } from "nanoid";

interface VisualEditorProps {
  post: Post;
  onChange: (post: Post) => void;
  showMetadata?: boolean;
  selectedCellId?: string | null;
  onCellSelect?: (cellId: string | null) => void;
  onRequestMedia?: (cellId: string) => void;
}

interface CellEditorProps {
  cell: Cell;
  index: number;
  total: number;
  onChange: (cell: Cell) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onInsertBelow: (type?: Cell["type"]) => void;
  onPickMedia: () => void;
  selected: boolean;
  onSelect: () => void;
}

function createCell(type: Cell["type"] = "markdown", content?: Cell["content"]): Cell {
  if (content) {
    return { id: nanoid(), type, content };
  }

  if (type === "image") {
    return { id: nanoid(), type, content: { url: "", alt: "" } };
  }

  if (type === "video") {
    return { id: nanoid(), type, content: { url: "", title: "", provider: "youtube" } };
  }

  if (type === "file") {
    return {
      id: nanoid(),
      type,
      content: {
        s3Url: "",
        displayType: "inline",
        fileType: "document",
        caption: "",
        originalName: "",
      },
    };
  }

  return { id: nanoid(), type: "markdown", content: "" };
}

function cloneCell(cell: Cell): Cell {
  return {
    ...cell,
    id: nanoid(),
    content: typeof cell.content === "string" ? cell.content : structuredClone(cell.content),
  };
}

function isCellEmpty(cell: Cell) {
  if (typeof cell.content === "string") return !cell.content.trim();
  if (cell.type === "image" || cell.type === "video") return !(cell.content as ImageContent | VideoContent).url?.trim();
  return !(cell.content as FileContent).s3Url?.trim();
}

function SortableCell(props: CellEditorProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: props.cell.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      id={`post-cell-${encodeURIComponent(props.cell.id)}`}
      ref={setNodeRef}
      style={style}
      tabIndex={-1}
      onFocusCapture={props.onSelect}
      onClick={props.onSelect}
      className={isDragging ? "opacity-60" : ""}
    >
      <div className={`group relative rounded-lg border transition-colors ${props.selected ? "border-foreground/25 bg-muted/25 ring-2 ring-ring/15" : "border-transparent bg-background hover:border-border"}`}>
        <div className={`absolute left-2 top-3 flex flex-col items-center gap-1 transition-opacity ${props.selected ? "opacity-100" : "opacity-0 group-hover:opacity-70 group-focus-within:opacity-100"}`}>
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Drag cell"
          >
            <Grip className="h-4 w-4 cursor-move" />
          </button>
        </div>
        <div className="pl-10">
          <CellEditor {...props} />
        </div>
      </div>
      <div className="group/insert flex h-8 items-center justify-center">
        <div className="h-px flex-1 bg-border/50 opacity-0 transition-opacity group-hover/insert:opacity-100" />
        <Button type="button" variant="ghost" size="sm" onClick={() => props.onInsertBelow()} className="relative z-10 mx-2 h-7 text-xs text-muted-foreground hover:text-foreground">
          <Plus className="h-3.5 w-3.5" />
          Add cell
        </Button>
        <div className="h-px flex-1 bg-border/50 opacity-0 transition-opacity group-hover/insert:opacity-100" />
      </div>
    </div>
  );
}

function CellEditor({
  cell,
  index,
  total,
  onChange,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onPickMedia,
  selected,
}: CellEditorProps) {
  const handleContentChange = (value: string | ImageContent | VideoContent | FileContent) => {
    onChange({ ...cell, content: value });
  };

  const handleTypeChange = (type: Cell["type"]) => {
    if (type === cell.type) return;
    onChange(createCell(type));
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
        <Select value={cell.type} onValueChange={(value) => handleTypeChange(value as Cell["type"])} disabled={!isCellEmpty(cell)}>
          <SelectTrigger className="h-8 w-28 border-0 bg-muted/50 text-xs shadow-none" title={!isCellEmpty(cell) ? "Cell type is locked after content is added" : "Change cell type"}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="markdown">Markdown</SelectItem>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="file">File</SelectItem>
          </SelectContent>
        </Select>

        <div className={`ml-auto flex items-center gap-1 transition-opacity ${selected ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"}`}>
          <Button type="button" variant="ghost" size="icon" onClick={onMoveUp} disabled={index === 0} title="Move up">
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={onMoveDown} disabled={index === total - 1} title="Move down">
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={onDuplicate} title="Duplicate">
            <Copy className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={onDelete} title="Delete">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {cell.type === "markdown" ? (
        <MarkdownEditor value={cell.content as string} onChange={handleContentChange} />
      ) : cell.type === "image" ? (
        <ImageCellEditor content={cell.content as ImageContent} onChange={handleContentChange} />
      ) : cell.type === "video" ? (
        <VideoCellEditor content={cell.content as VideoContent} onChange={handleContentChange} />
      ) : (
        <FileCellEditor
          content={cell.content as FileContent}
          onChange={handleContentChange}
          onPickMedia={onPickMedia}
        />
      )}

    </div>
  );
}

function ImageCellEditor({ content, onChange }: { content: ImageContent; onChange: (content: ImageContent) => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>Image URL</Label>
        <Input value={content.url} onChange={(e) => onChange({ ...content, url: e.target.value })} placeholder="https://..." />
      </div>
      <div className="space-y-2">
        <Label>Alt text</Label>
        <Input value={content.alt} onChange={(e) => onChange({ ...content, alt: e.target.value })} placeholder="Description" />
      </div>
    </div>
  );
}

function VideoCellEditor({ content, onChange }: { content: VideoContent; onChange: (content: VideoContent) => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-2 md:col-span-2">
        <Label>Video URL</Label>
        <Input value={content.url} onChange={(e) => onChange({ ...content, url: e.target.value })} placeholder="https://..." />
      </div>
      <div className="space-y-2">
        <Label>Provider</Label>
        <Select value={content.provider || "youtube"} onValueChange={(provider) => onChange({ ...content, provider: provider as VideoContent["provider"] })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="youtube">YouTube</SelectItem>
            <SelectItem value="vimeo">Vimeo</SelectItem>
            <SelectItem value="direct">Direct</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 md:col-span-3">
        <Label>Title</Label>
        <Input value={content.title || ""} onChange={(e) => onChange({ ...content, title: e.target.value })} placeholder="Optional" />
      </div>
    </div>
  );
}

function FileCellEditor({
  content,
  onChange,
  onPickMedia,
}: {
  content: FileContent;
  onChange: (content: FileContent) => void;
  onPickMedia: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onPickMedia}>
          Pick uploaded file
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label>S3 URL</Label>
          <Input value={content.s3Url || ""} onChange={(e) => onChange({ ...content, s3Url: e.target.value })} placeholder="https://..." />
        </div>
        <div className="space-y-2">
          <Label>File type</Label>
          <Select value={content.fileType || "document"} onValueChange={(fileType) => onChange({ ...content, fileType: fileType as FileContent["fileType"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="document">Document</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Display</Label>
          <Select value={content.displayType || "inline"} onValueChange={(displayType) => onChange({ ...content, displayType: displayType as FileContent["displayType"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="inline">Inline</SelectItem>
              <SelectItem value="attachment">Attachment</SelectItem>
              <SelectItem value="gallery">Gallery</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={content.originalName || ""} onChange={(e) => onChange({ ...content, originalName: e.target.value })} placeholder="Filename" />
        </div>
        <div className="space-y-2">
          <Label>Caption</Label>
          <Input value={content.caption || ""} onChange={(e) => onChange({ ...content, caption: e.target.value })} placeholder="Optional" />
        </div>
      </div>
    </div>
  );
}

export function VisualEditor({
  post,
  onChange,
  showMetadata = true,
  selectedCellId = null,
  onCellSelect,
  onRequestMedia,
}: VisualEditorProps) {
  const [localPost, setLocalPost] = useState<Post>(post);

  useEffect(() => {
    setLocalPost(post);
  }, [post]);

  const updatePost = useCallback((updateFn: (prev: Post) => Post) => {
    setLocalPost((prev) => {
      const nextPost = updateFn(prev);
      queueMicrotask(() => onChange(nextPost));
      return nextPost;
    });
  }, [onChange]);

  useEffect(() => {
    const saveDraft = window.setTimeout(() => {
      try {
        localStorage.setItem(
          `supers:post-editor:draft:${localPost.id}`,
          JSON.stringify({ savedAt: new Date().toISOString(), post: localPost })
        );
      } catch {
        // Local recovery is best-effort only.
      }
    }, 600);

    return () => window.clearTimeout(saveDraft);
  }, [localPost]);

  const handleCellChange = useCallback((index: number, cell: Cell) => {
    updatePost((prev) => ({
      ...prev,
      cells: prev.cells.map((current, i) => (i === index ? cell : current)),
    }));
  }, [updatePost]);

  const insertCell = useCallback((afterIndex: number | null = null, type: Cell["type"] = "markdown") => {
    const nextCell = createCell(type);
    updatePost((prev) => {
      const cells = [...prev.cells];
      const insertAt = afterIndex === null ? cells.length : afterIndex + 1;
      cells.splice(insertAt, 0, nextCell);
      return { ...prev, cells };
    });
    requestAnimationFrame(() => onCellSelect?.(nextCell.id));
  }, [onCellSelect, updatePost]);

  const deleteCell = useCallback((index: number) => {
    const fallbackCell = localPost.cells[index - 1] || localPost.cells[index + 1];
    updatePost((prev) => ({ ...prev, cells: prev.cells.filter((_, i) => i !== index) }));
    onCellSelect?.(fallbackCell?.id || null);
  }, [localPost.cells, onCellSelect, updatePost]);

  const duplicateCell = useCallback((index: number) => {
    updatePost((prev) => {
      const cells = [...prev.cells];
      cells.splice(index + 1, 0, cloneCell(prev.cells[index]));
      return { ...prev, cells };
    });
  }, [updatePost]);

  const moveCell = useCallback((index: number, direction: -1 | 1) => {
    updatePost((prev) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.cells.length) return prev;
      return { ...prev, cells: arrayMove(prev.cells, index, nextIndex) };
    });
  }, [updatePost]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event: { active: { id: string | number }; over: { id: string | number } | null }) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    updatePost((prev) => {
      const oldIndex = prev.cells.findIndex((cell) => cell.id === active.id);
      const newIndex = prev.cells.findIndex((cell) => cell.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return prev;
      return { ...prev, cells: arrayMove(prev.cells, oldIndex, newIndex) };
    });
  }, [updatePost]);

  return (
    <div className="space-y-6">
      {showMetadata && (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={localPost.title} onChange={(e) => updatePost((prev) => ({ ...prev, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Excerpt</Label>
              <Input value={localPost.excerpt || ""} onChange={(e) => updatePost((prev) => ({ ...prev, excerpt: e.target.value }))} />
            </div>
          </div>

          <Card className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={localPost.type} onValueChange={(value: PostType) => updatePost((prev) => ({ ...prev, type: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {POST_TYPES.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={localPost.status} onValueChange={(status) => updatePost((prev) => ({ ...prev, status: status as Post["status"] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={localPost.featured} onCheckedChange={(featured) => updatePost((prev) => ({ ...prev, featured }))} />
              <Label>Featured</Label>
            </div>
            <div className="space-y-2">
              <Label>Thumbnail URL</Label>
              <Input value={localPost.thumbnail?.url || ""} onChange={(e) => updatePost((prev) => ({ ...prev, thumbnail: { ...(prev.thumbnail || { alt: "" }), url: e.target.value } }))} />
            </div>
            <div className="space-y-2">
              <Label>Thumbnail alt</Label>
              <Input value={localPost.thumbnail?.alt || ""} onChange={(e) => updatePost((prev) => ({ ...prev, thumbnail: { ...(prev.thumbnail || { url: "" }), alt: e.target.value } }))} />
            </div>
          </Card>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Label>Cells</Label>
            <p className="text-sm text-muted-foreground">{localPost.cells.length} cell{localPost.cells.length === 1 ? "" : "s"}</p>
          </div>
          <Button type="button" onClick={() => insertCell(null, "markdown")} variant="outline" size="sm">
            <Plus className="h-4 w-4" />Add cell
          </Button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={localPost.cells.map((cell) => cell.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {localPost.cells.map((cell, index) => (
                <SortableCell
                  key={cell.id}
                  cell={cell}
                  index={index}
                  total={localPost.cells.length}
                  onChange={(nextCell) => handleCellChange(index, nextCell)}
                  onDelete={() => deleteCell(index)}
                  onDuplicate={() => duplicateCell(index)}
                  onMoveUp={() => moveCell(index, -1)}
                  onMoveDown={() => moveCell(index, 1)}
                  onInsertBelow={(type) => insertCell(index, type || "markdown")}
                  onPickMedia={() => {
                    onCellSelect?.(cell.id);
                    onRequestMedia?.(cell.id);
                  }}
                  selected={selectedCellId === cell.id}
                  onSelect={() => onCellSelect?.(cell.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

    </div>
  );
}
