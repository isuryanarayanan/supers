"use client";

import { Cell, FileContent, ImageContent, Post, VideoContent } from "@/types/post";
import { POST_TYPES, PostType } from "@/lib/constants";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MarkdownEditor } from "@/components/editor/markdown-editor";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  File,
  Grip,
  Image as ImageIcon,
  Music,
  Plus,
  Search,
  Trash2,
  Video,
} from "lucide-react";
import { nanoid } from "nanoid";
import { toast } from "sonner";

interface VisualEditorProps {
  post: Post;
  onChange: (post: Post) => void;
}

interface FileRecord {
  id: string;
  key?: string;
  filename?: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadedAt?: Date | string;
  s3Url: string;
  metadata?: Record<string, unknown>;
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

function fileTypeFromMime(mimeType: string): FileContent["fileType"] {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "document";
}

function fileToCell(file: FileRecord): Cell {
  const fileType = fileTypeFromMime(file.mimeType || "");
  return createCell("file", {
    s3Url: file.s3Url,
    displayType: fileType === "document" ? "attachment" : "inline",
    fileType,
    originalName: file.originalName || file.filename || file.key || "File",
    size: file.size,
    caption: "",
  });
}

function SortableCell(props: CellEditorProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: props.cell.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "opacity-60" : ""}>
      <div className="group relative rounded-xl border bg-card/70 shadow-sm transition-colors focus-within:border-primary/50">
        <div className="absolute left-3 top-4 flex flex-col items-center gap-1 opacity-60 transition-opacity group-hover:opacity-100">
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
      <div className="flex justify-center py-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => props.onInsertBelow()}>
          <Plus className="mr-2 h-4 w-4" />
          Add below
        </Button>
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
  onInsertBelow,
  onPickMedia,
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
        <Select value={cell.type} onValueChange={(value) => handleTypeChange(value as Cell["type"])}>
          <SelectTrigger className="h-9 w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="markdown">Markdown</SelectItem>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="file">File</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-1">
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

      <div className="flex flex-wrap gap-2 border-t pt-3">
        <Button type="button" variant="outline" size="sm" onClick={() => onInsertBelow("markdown")}>Markdown below</Button>
        <Button type="button" variant="outline" size="sm" onClick={() => onInsertBelow("file")}>File below</Button>
      </div>
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

function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
  onUseAsThumbnail,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (file: FileRecord) => void;
  onUseAsThumbnail: (file: FileRecord) => void;
}) {
  const { token } = useAuth();
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !token) return;

    const loadFiles = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/files`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setFiles(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load files", error);
        toast.error("Failed to load files");
      } finally {
        setLoading(false);
      }
    };

    loadFiles();
  }, [open, token]);

  const filteredFiles = useMemo(() => {
    const value = query.toLowerCase().trim();
    if (!value) return files;
    return files.filter((file) =>
      `${file.originalName} ${file.mimeType}`.toLowerCase().includes(value)
    );
  }, [files, query]);

  const iconFor = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <ImageIcon className="h-4 w-4" />;
    if (mimeType.startsWith("video/")) return <Video className="h-4 w-4" />;
    if (mimeType.startsWith("audio/")) return <Music className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[82vh] max-w-4xl overflow-hidden p-0">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle>Media</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 p-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search files..." className="pl-10" />
          </div>
          <div className="max-h-[58vh] overflow-y-auto">
            {loading ? (
              <div className="py-12 text-center text-muted-foreground">Loading files...</div>
            ) : filteredFiles.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No files found.</div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {filteredFiles.map((file) => (
                  <div key={file.id || file.s3Url} className="rounded-lg border p-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 text-muted-foreground">{iconFor(file.mimeType || "")}</div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium" title={file.originalName}>{file.originalName}</p>
                        <p className="text-xs text-muted-foreground">{file.mimeType}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button type="button" size="sm" onClick={() => onSelect(file)}>Insert</Button>
                      {(file.mimeType || "").startsWith("image/") && (
                        <Button type="button" size="sm" variant="outline" onClick={() => onUseAsThumbnail(file)}>
                          Use as thumbnail
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function VisualEditor({ post, onChange }: VisualEditorProps) {
  const [localPost, setLocalPost] = useState<Post>(post);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaInsertIndex, setMediaInsertIndex] = useState<number | null>(null);

  useEffect(() => {
    setLocalPost(post);
  }, [post]);

  const emitChange = useCallback((nextPost: Post) => {
    setLocalPost(nextPost);
    onChange(nextPost);
  }, [onChange]);

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

  const insertCell = useCallback((afterIndex: number | null = null, type: Cell["type"] = "markdown", cell?: Cell) => {
    updatePost((prev) => {
      const nextCell = cell || createCell(type);
      const cells = [...prev.cells];
      const insertAt = afterIndex === null ? cells.length : afterIndex + 1;
      cells.splice(insertAt, 0, nextCell);
      return { ...prev, cells };
    });
  }, [updatePost]);

  const deleteCell = useCallback((index: number) => {
    updatePost((prev) => ({ ...prev, cells: prev.cells.filter((_, i) => i !== index) }));
  }, [updatePost]);

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

  const openMediaPicker = useCallback((afterIndex: number | null) => {
    setMediaInsertIndex(afterIndex);
    setMediaPickerOpen(true);
  }, []);

  const handleMediaSelect = useCallback((file: FileRecord) => {
    insertCell(mediaInsertIndex, "file", fileToCell(file));
    setMediaPickerOpen(false);
    toast.success("File inserted");
  }, [insertCell, mediaInsertIndex]);

  const handleUseAsThumbnail = useCallback((file: FileRecord) => {
    emitChange({
      ...localPost,
      thumbnail: { url: file.s3Url, alt: file.originalName || "" },
    });
    setMediaPickerOpen(false);
    toast.success("Thumbnail updated");
  }, [emitChange, localPost]);

  return (
    <div className="space-y-6">
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
          <Button type="button" variant="outline" onClick={() => openMediaPicker(null)} className="w-full">
            Pick thumbnail / insert media
          </Button>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Label>Cells</Label>
            <p className="text-sm text-muted-foreground">{localPost.cells.length} cell{localPost.cells.length === 1 ? "" : "s"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => insertCell(null, "markdown")} variant="outline" size="sm"><Plus className="mr-2 h-4 w-4" />Markdown</Button>
            <Button type="button" onClick={() => insertCell(null, "image")} variant="outline" size="sm"><Plus className="mr-2 h-4 w-4" />Image</Button>
            <Button type="button" onClick={() => insertCell(null, "video")} variant="outline" size="sm"><Plus className="mr-2 h-4 w-4" />Video</Button>
            <Button type="button" onClick={() => openMediaPicker(null)} variant="outline" size="sm"><Plus className="mr-2 h-4 w-4" />File</Button>
          </div>
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
                  onPickMedia={() => openMediaPicker(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <MediaPickerDialog
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        onSelect={handleMediaSelect}
        onUseAsThumbnail={handleUseAsThumbnail}
      />
    </div>
  );
}
