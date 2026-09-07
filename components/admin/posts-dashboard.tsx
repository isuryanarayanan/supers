"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { ArrowLeft, Check, Clock, Copy, ExternalLink, Eye, File, Image as ImageIcon, ListTree, Loader2, Music, PanelRight, Pencil, Plus, RefreshCw, Search, Trash2, Video, X } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { PostCell } from "@/components/post/post-cell";
import { VisualEditor } from "@/components/editor/visual-editor";
import { postsApi } from "@/lib/posts-api";
import { POST_TYPES, PostType } from "@/lib/constants";
import { Cell, FileContent, ImageContent, Post, VideoContent } from "@/types/post";

type DashboardMode = "edit" | "split" | "preview";
type DashboardPanel = "settings" | "media" | "validation" | "json";
type SaveState = "idle" | "dirty" | "saving" | "saved" | "failed";
type StatusFilter = "all" | "draft" | "published";

type SwitchIntent =
  | { type: "select"; post: Post }
  | { type: "new" }
  | { type: "clear" }
  | null;

interface ValidationIssue {
  level: "warning" | "error";
  message: string;
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

function clonePost(post: Post): Post {
  return JSON.parse(JSON.stringify(post)) as Post;
}

function createBlankDraft(): Post {
  const now = new Date().toISOString();

  return {
    id: `local-${nanoid()}`,
    title: "",
    type: "blog",
    status: "draft",
    featured: false,
    excerpt: "",
    thumbnail: undefined,
    cells: [{ id: nanoid(), type: "markdown", content: "" }],
    createdAt: now,
    updatedAt: now,
    viewCount: 0,
  };
}

function normalizeThumbnail(post: Post): Post["thumbnail"] {
  const url = post.thumbnail?.url?.trim() || "";
  const alt = post.thumbnail?.alt?.trim() || "";

  if (!url) return undefined;
  return { url, alt };
}

function normalizeCell(cell: Cell): Cell {
  if (cell.type === "markdown") {
    return { ...cell, content: typeof cell.content === "string" ? cell.content : "" };
  }

  if (cell.type === "image") {
    const content = (typeof cell.content === "object" && cell.content ? cell.content : {}) as Partial<ImageContent>;
    return { ...cell, content: { url: content.url || "", alt: content.alt || "" } };
  }

  if (cell.type === "video") {
    const content = (typeof cell.content === "object" && cell.content ? cell.content : {}) as Partial<VideoContent>;
    return {
      ...cell,
      content: {
        url: content.url || "",
        title: content.title || "",
        provider: content.provider || "youtube",
      },
    };
  }

  const content = (typeof cell.content === "object" && cell.content ? cell.content : {}) as Partial<FileContent>;
  return {
    ...cell,
    content: {
      s3Url: content.s3Url || "",
      displayType: content.displayType || "inline",
      caption: content.caption || "",
      fileType: content.fileType || "document",
      originalName: content.originalName || "",
      size: content.size,
    },
  };
}

function normalizePostForSave(post: Post): Post {
  return {
    ...post,
    title: post.title.trim() || "Untitled",
    type: post.type === "project" ? "project" : "blog",
    status: post.status === "published" ? "published" : "draft",
    excerpt: post.excerpt?.trim() || "",
    thumbnail: normalizeThumbnail(post),
    cells: post.cells.map(normalizeCell),
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

  return {
    id: nanoid(),
    type: "file",
    content: {
      s3Url: file.s3Url,
      displayType: fileType === "document" ? "attachment" : "inline",
      fileType,
      originalName: file.originalName || file.filename || file.key || "File",
      size: file.size,
      caption: "",
    },
  };
}

function getValidationIssues(post: Post | null): ValidationIssue[] {
  if (!post) return [];

  const issues: ValidationIssue[] = [];
  if (!post.title.trim()) issues.push({ level: "error", message: "Title is missing." });
  if (!POST_TYPES.some((type) => type.value === post.type)) issues.push({ level: "error", message: "Post type must be project or blog." });
  if (!post.cells.length) issues.push({ level: post.status === "published" ? "error" : "warning", message: "Post has no cells." });
  if (post.thumbnail?.url && !post.thumbnail.alt?.trim()) issues.push({ level: "warning", message: "Thumbnail is missing alt text." });

  post.cells.forEach((cell, index) => {
    const label = `Cell ${index + 1}`;
    if (cell.type === "markdown" && typeof cell.content === "string" && !cell.content.trim()) {
      issues.push({ level: "warning", message: `${label} is empty.` });
    }
    if (cell.type === "image") {
      const content = cell.content as ImageContent;
      if (!content.url?.trim()) issues.push({ level: "error", message: `${label} image URL is missing.` });
      if (!content.alt?.trim()) issues.push({ level: "warning", message: `${label} image alt text is missing.` });
    }
    if (cell.type === "video") {
      const content = cell.content as VideoContent;
      if (!content.url?.trim()) issues.push({ level: "error", message: `${label} video URL is missing.` });
      if (content.provider && !["youtube", "vimeo", "direct"].includes(content.provider)) {
        issues.push({ level: "error", message: `${label} has an unsupported video provider.` });
      }
    }
    if (cell.type === "file") {
      const content = cell.content as FileContent;
      if (!content.s3Url?.trim()) issues.push({ level: "error", message: `${label} file URL is missing.` });
    }
  });

  return issues;
}

function getCellLabel(cell: Cell, index: number) {
  if (cell.type === "markdown" && typeof cell.content === "string") {
    const heading = cell.content.split("\n").find((line) => line.trim().startsWith("#"));
    if (heading) return heading.replace(/^#+/, "").trim() || `Markdown ${index + 1}`;
  }
  return `${cell.type.charAt(0).toUpperCase()}${cell.type.slice(1)} ${index + 1}`;
}

function getCounts(posts: Post[]) {
  return {
    total: posts.length,
    draft: posts.filter((post) => post.status === "draft").length,
    published: posts.filter((post) => post.status === "published").length,
  };
}

export function PostsDashboard() {
  const { token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | PostType>("all");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [originalPost, setOriginalPost] = useState<Post | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [switchIntent, setSwitchIntent] = useState<SwitchIntent>(null);
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [mobilePanel, setMobilePanel] = useState<"outline" | "inspector" | null>(null);

  const requestedPost = searchParams.get("post");
  const requestedMode = searchParams.get("mode");
  const requestedPanel = searchParams.get("panel");
  const mode: DashboardMode = requestedMode === "split" || requestedMode === "preview" ? requestedMode : "edit";
  const panel: DashboardPanel = requestedPanel === "media" || requestedPanel === "validation" || requestedPanel === "json" ? requestedPanel : "settings";

  const dirty = saveState === "dirty" || (!!selectedPost && !!originalPost && JSON.stringify(selectedPost) !== JSON.stringify(originalPost));
  const counts = useMemo(() => getCounts(posts), [posts]);
  const validationIssues = useMemo(() => getValidationIssues(selectedPost), [selectedPost]);

  const setRouteState = useCallback((
    next: { post?: string | null; mode?: DashboardMode; panel?: DashboardPanel },
    method: "push" | "replace" = "replace"
  ) => {
    if (next.post === null) {
      router[method](pathname, { scroll: false });
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    if (next.post !== undefined) {
      params.set("post", next.post);
      params.set("mode", next.mode || "edit");
      params.set("panel", next.panel || "settings");
    } else {
      if (next.mode) params.set("mode", next.mode);
      if (next.panel) params.set("panel", next.panel);
    }

    const nextQuery = params.toString();
    router[method](nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const [published, drafts] = await Promise.all([
        postsApi.listPosts({ status: "published", limit: 1000 }),
        postsApi.listPosts({ status: "draft", limit: 1000 }),
      ]);

      const allPosts = [
        ...((Array.isArray(published.data) ? published.data : []) as Post[]),
        ...((Array.isArray(drafts.data) ? drafts.data : []) as Post[]),
      ];

      const uniquePosts = Array.from(new Map(allPosts.map((post) => [post.id, post])).values()).sort((a, b) => {
        return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
      });

      setPosts(uniquePosts);
    } catch (error) {
      console.error("Error loading posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    postsApi.setAuthToken(token);
    loadPosts();
  }, [loadPosts, token]);

  useEffect(() => {
    if (!requestedPost) {
      if (selectedPost && !dirty) {
        setSelectedPost(null);
        setOriginalPost(null);
        setSaveState("idle");
      }
      return;
    }

    if (requestedPost === "new") {
      if (selectedPost?.id.startsWith("local-")) return;
      const draft = createBlankDraft();
      setSelectedPost(draft);
      setOriginalPost(clonePost(draft));
      setSelectedCellId(draft.cells[0]?.id || null);
      setSaveState("dirty");
      return;
    }

    if (selectedPost?.id === requestedPost) return;
    if (!posts.length) return;
    const post = posts.find((item) => item.id === requestedPost);
    if (post && !dirty) {
      setSelectedPost(clonePost(post));
      setOriginalPost(clonePost(post));
      setSelectedCellId(post.cells[0]?.id || null);
      setSaveState("idle");
    }
  }, [dirty, posts, requestedPost, selectedPost]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  const filteredPosts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return posts.filter((post) => {
      if (statusFilter !== "all" && post.status !== statusFilter) return false;
      if (typeFilter !== "all" && post.type !== typeFilter) return false;
      if (!needle) return true;
      return `${post.title} ${post.excerpt || ""} ${post.type} ${post.status}`.toLowerCase().includes(needle);
    });
  }, [posts, query, statusFilter, typeFilter]);

  const runIntent = useCallback((intent: Exclude<SwitchIntent, null>) => {
    if (intent.type === "new") {
      const draft = createBlankDraft();
      setSelectedPost(draft);
      setOriginalPost(clonePost(draft));
      setSaveState("dirty");
      setSelectedCellId(draft.cells[0]?.id || null);
      setRouteState({ post: "new", mode: "edit", panel: "settings" }, "push");
      return;
    }

    if (intent.type === "clear") {
      setSelectedPost(null);
      setOriginalPost(null);
      setSelectedCellId(null);
      setSaveState("idle");
      setRouteState({ post: null }, "push");
      return;
    }

    setSelectedPost(clonePost(intent.post));
    setOriginalPost(clonePost(intent.post));
    setSelectedCellId(intent.post.cells[0]?.id || null);
    setSaveState("idle");
    setRouteState({ post: intent.post.id, mode: "edit", panel: "settings" }, "push");
  }, [setRouteState]);

  const requestIntent = useCallback((intent: Exclude<SwitchIntent, null>) => {
    if (dirty) {
      setSwitchIntent(intent);
      return;
    }
    runIntent(intent);
  }, [dirty, runIntent]);

  const handleEditorChange = useCallback((post: Post) => {
    setSelectedPost(post);
    setSaveState("dirty");
  }, []);

  const updateSelectedPost = useCallback((updater: (post: Post) => Post) => {
    setSelectedPost((current) => {
      if (!current) return current;
      const next = updater(current);
      setSaveState("dirty");
      return next;
    });
  }, []);

  const insertFileCell = useCallback((file: FileRecord) => {
    const nextCell = fileToCell(file);
    updateSelectedPost((post) => {
      const cells = [...post.cells];
      const selectedIndex = selectedCellId ? cells.findIndex((cell) => cell.id === selectedCellId) : -1;
      cells.splice(selectedIndex >= 0 ? selectedIndex + 1 : cells.length, 0, nextCell);
      return { ...post, cells };
    });
    setSelectedCellId(nextCell.id);
    toast.success("File inserted");
  }, [selectedCellId, updateSelectedPost]);

  const useFileAsThumbnail = useCallback((file: FileRecord) => {
    updateSelectedPost((post) => ({
      ...post,
      thumbnail: { url: file.s3Url, alt: file.originalName || "" },
    }));
    toast.success("Thumbnail updated");
  }, [updateSelectedPost]);

  const saveCurrentPost = useCallback(async () => {
    if (!selectedPost || !token) return false;

    const normalized = normalizePostForSave(selectedPost);
    const payload = {
      title: normalized.title,
      status: normalized.status,
      featured: normalized.featured,
      type: normalized.type,
      excerpt: normalized.excerpt,
      thumbnail: normalized.thumbnail,
      cells: normalized.cells.map((cell) => ({ type: cell.type, content: cell.content })),
    };

    try {
      setSaveState("saving");
      if (normalized.id.startsWith("local-")) {
        const response = await postsApi.createPost(payload);
        if (!response.success || !response.data || typeof response.data !== "object") {
          throw new Error(response.error || "Failed to create post");
        }
        const created = response.data as Post;
        const nextPost = { ...normalized, id: created.id, slug: created.slug, createdAt: created.createdAt, updatedAt: created.updatedAt };
        setSelectedPost(nextPost);
        setOriginalPost(clonePost(nextPost));
        setPosts((current) => [nextPost, ...current.filter((post) => post.id !== nextPost.id)]);
        setRouteState({ post: nextPost.id }, "replace");
      } else {
        const response = await postsApi.updatePost(normalized.id, payload);
        if (!response.success) throw new Error(response.error || "Failed to save post");
        const nextPost = { ...normalized, updatedAt: new Date().toISOString() };
        setSelectedPost(nextPost);
        setOriginalPost(clonePost(nextPost));
        setPosts((current) => current.map((post) => (post.id === nextPost.id ? nextPost : post)));
      }
      setSaveState("saved");
      toast.success("Saved");
      return true;
    } catch (error) {
      console.error("Error saving post:", error);
      setSaveState("failed");
      toast.error("Failed to save post");
      return false;
    }
  }, [selectedPost, setRouteState, token]);

  const confirmSwitchSave = useCallback(async () => {
    if (!switchIntent) return;
    const saved = await saveCurrentPost();
    if (!saved) return;
    runIntent(switchIntent);
    setSwitchIntent(null);
  }, [runIntent, saveCurrentPost, switchIntent]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;

    try {
      const response = await postsApi.deletePost(deleteTarget.id);
      if (!response.success) throw new Error(response.error || "Failed to delete post");
      setPosts((current) => current.filter((post) => post.id !== deleteTarget.id));
      if (selectedPost?.id === deleteTarget.id) {
        setSelectedPost(null);
        setOriginalPost(null);
        setRouteState({ post: null }, "push");
      }
      toast.success("Deleted");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteTarget, selectedPost, setRouteState]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMod = event.metaKey || event.ctrlKey;
      if (!isMod) return;

      if (event.key.toLowerCase() === "s") {
        event.preventDefault();
        saveCurrentPost();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saveCurrentPost]);

  const saveLabel = saveState === "saving" ? "Saving…" : saveState === "failed" ? "Save failed" : dirty ? "Unsaved" : "Saved";

  const selectOutlineCell = useCallback((cellId: string) => {
    setSelectedCellId(cellId);
    setMobilePanel(null);
    requestAnimationFrame(() => {
      document.getElementById(`post-cell-${encodeURIComponent(cellId)}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      document.getElementById(`post-cell-${encodeURIComponent(cellId)}`)?.focus({ preventScroll: true });
    });
  }, []);

  return (
    <div className="admin-workspace -my-6 w-screen overflow-x-clip bg-background md:-my-10">
      {!selectedPost ? (
        <PostsIndex
          counts={counts}
          filteredPosts={filteredPosts}
          loading={loading}
          query={query}
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          onQueryChange={setQuery}
          onStatusFilterChange={setStatusFilter}
          onTypeFilterChange={setTypeFilter}
          onNew={() => requestIntent({ type: "new" })}
          onSelect={(post) => requestIntent({ type: "select", post })}
          onRefresh={loadPosts}
        />
      ) : (
        <div className="min-h-[calc(100dvh-4rem)]">
          <header className="sticky top-16 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
            <div className={`xl:grid ${mode === "edit" ? "xl:grid-cols-[224px_minmax(0,1fr)_320px]" : mode === "split" ? "xl:grid-cols-[224px_minmax(0,1fr)]" : ""}`}>
              {mode !== "preview" && (
                <div className="hidden h-14 items-center border-r px-3 xl:flex">
                  <Button variant="ghost" size="sm" onClick={() => requestIntent({ type: "clear" })} className="px-2">
                    <ArrowLeft className="h-4 w-4" />Posts
                  </Button>
                </div>
              )}

              <div className="flex h-14 min-w-0 items-center gap-2 px-3 sm:px-4">
                <Button variant="ghost" size="sm" onClick={() => requestIntent({ type: "clear" })} className={`px-2 sm:px-3 ${mode !== "preview" ? "xl:hidden" : ""}`}>
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Posts</span>
                </Button>
                <Separator orientation="vertical" className="hidden h-5 sm:block xl:hidden" />
                <Input
                  value={selectedPost.title}
                  onChange={(event) => updateSelectedPost((post) => ({ ...post, title: event.target.value }))}
                  className="h-9 min-w-24 flex-1 border-0 bg-transparent px-1 text-base font-semibold shadow-none focus-visible:ring-0 sm:text-lg"
                  placeholder="Untitled"
                  aria-label="Post title"
                />

                {mode !== "preview" && (
                  <>
                    <Button variant="ghost" size="icon" className="xl:hidden" onClick={() => setMobilePanel("outline")} aria-label="Open outline" title="Outline">
                      <ListTree className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="xl:hidden" onClick={() => setMobilePanel("inspector")} aria-label="Open inspector" title="Inspector">
                      <PanelRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setRouteState({ mode: mode === "preview" ? "edit" : "preview" })} aria-label={mode === "preview" ? "Return to editor" : "Preview post"} title={mode === "preview" ? "Edit" : "Preview"}>
                  {mode === "preview" ? <Pencil className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>

                <div className="hidden items-center gap-1 rounded-md border p-0.5 md:flex">
                  {(["edit", "split", "preview"] as DashboardMode[]).map((item) => (
                    <Button key={item} variant={mode === item ? "secondary" : "ghost"} size="sm" onClick={() => setRouteState({ mode: item })} className={`h-7 capitalize ${item === "split" ? "hidden xl:inline-flex" : ""}`}>
                      {item === "edit" ? <Pencil className="h-3.5 w-3.5" /> : item === "preview" ? <Eye className="h-3.5 w-3.5" /> : null}
                      {item}
                    </Button>
                  ))}
                </div>

                <div className={`hidden items-center gap-1 text-xs sm:flex ${saveState === "failed" ? "text-destructive" : "text-muted-foreground"}`} aria-live="polite">
                  {saveState === "saving" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : !dirty && saveState !== "failed" ? <Check className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                  {saveLabel}
                </div>
                <Button size="sm" onClick={saveCurrentPost} disabled={saveState === "saving" || !dirty}>
                  {selectedPost.id.startsWith("local-") ? "Create" : saveState === "failed" ? "Retry" : "Save"}
                </Button>
              </div>

              {mode === "edit" && <div className="hidden border-l xl:block" />}
            </div>
          </header>

          {mode === "preview" ? (
            <main className="min-h-[calc(100dvh-7.5rem)] bg-muted/10">
              <PostPreview post={selectedPost} />
            </main>
          ) : (
            <main className={`grid min-h-[calc(100dvh-7.5rem)] ${mode === "split" ? "xl:grid-cols-[224px_minmax(0,1fr)]" : "xl:grid-cols-[224px_minmax(640px,1fr)_320px]"}`}>
              <aside className="hidden border-r bg-muted/10 xl:block">
                <div className="sticky top-30 max-h-[calc(100dvh-7.5rem)] overflow-y-auto p-4">
                  <EditorOutlineRail post={selectedPost} selectedCellId={selectedCellId} onSelect={selectOutlineCell} />
                </div>
              </aside>

              <section className="min-w-0 bg-background">
                {mode === "split" ? (
                  <div className="grid min-h-full xl:grid-cols-2">
                    <EditorCanvas post={selectedPost} selectedCellId={selectedCellId} onChange={handleEditorChange} onCellSelect={setSelectedCellId} onRequestMedia={() => { setRouteState({ panel: "media" }); setMobilePanel("inspector"); }} />
                    <div className="hidden border-l bg-muted/10 xl:block"><PostPreview post={selectedPost} compact /></div>
                  </div>
                ) : (
                  <EditorCanvas post={selectedPost} selectedCellId={selectedCellId} onChange={handleEditorChange} onCellSelect={setSelectedCellId} onRequestMedia={() => { setRouteState({ panel: "media" }); setMobilePanel("inspector"); }} />
                )}
              </section>

              {mode === "edit" && (
                <aside className="hidden border-l bg-muted/10 xl:block">
                  <div className="sticky top-30 max-h-[calc(100dvh-7.5rem)] overflow-y-auto">
                    <EditorInspector
                      post={selectedPost}
                      panel={panel}
                      token={token}
                      issues={validationIssues}
                      onPanelChange={(nextPanel) => setRouteState({ panel: nextPanel })}
                      onChange={updateSelectedPost}
                      onDelete={() => setDeleteTarget(selectedPost)}
                      onInsert={insertFileCell}
                      onUseAsThumbnail={useFileAsThumbnail}
                    />
                  </div>
                </aside>
              )}
            </main>
          )}

          {mobilePanel && mode !== "preview" && (
            <div className="fixed inset-0 z-50 xl:hidden" role="dialog" aria-modal="true" aria-label={mobilePanel === "outline" ? "Post outline" : "Post inspector"}>
              <button className="absolute inset-0 bg-black/35" onClick={() => setMobilePanel(null)} aria-label="Close panel" />
              <aside className={`absolute inset-y-0 w-[min(88vw,360px)] overflow-y-auto bg-background shadow-xl ${mobilePanel === "outline" ? "left-0 border-r" : "right-0 border-l"}`}>
                <div className="flex h-14 items-center justify-between border-b px-4">
                  <p className="text-sm font-semibold">{mobilePanel === "outline" ? "Outline" : "Inspector"}</p>
                  <Button variant="ghost" size="icon" onClick={() => setMobilePanel(null)} aria-label="Close panel"><X className="h-4 w-4" /></Button>
                </div>
                {mobilePanel === "outline" ? (
                  <div className="p-4"><EditorOutlineRail post={selectedPost} selectedCellId={selectedCellId} onSelect={selectOutlineCell} /></div>
                ) : (
                  <EditorInspector
                    post={selectedPost}
                    panel={panel}
                    token={token}
                    issues={validationIssues}
                    onPanelChange={(nextPanel) => setRouteState({ panel: nextPanel })}
                    onChange={updateSelectedPost}
                    onDelete={() => setDeleteTarget(selectedPost)}
                    onInsert={insertFileCell}
                    onUseAsThumbnail={useFileAsThumbnail}
                  />
                )}
              </aside>
            </div>
          )}
        </div>
      )}

      <Dialog open={!!switchIntent} onOpenChange={(open) => !open && setSwitchIntent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved changes</DialogTitle>
            <DialogDescription>Save your changes before continuing, or discard your local edits.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSwitchIntent(null)}>Cancel</Button>
            <Button variant="secondary" onClick={() => { if (switchIntent) runIntent(switchIntent); setSwitchIntent(null); }}>Discard</Button>
            <Button onClick={confirmSwitchSave}>Save and continue</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete post?</DialogTitle>
            <DialogDescription>{deleteTarget ? `Delete “${deleteTarget.title}”? This cannot be undone.` : "This cannot be undone."}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}><Trash2 className="h-4 w-4" />Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PostsIndex({
  counts,
  filteredPosts,
  loading,
  query,
  statusFilter,
  typeFilter,
  onQueryChange,
  onStatusFilterChange,
  onTypeFilterChange,
  onNew,
  onSelect,
  onRefresh,
}: {
  counts: ReturnType<typeof getCounts>;
  filteredPosts: Post[];
  loading: boolean;
  query: string;
  statusFilter: StatusFilter;
  typeFilter: "all" | PostType;
  onQueryChange: (query: string) => void;
  onStatusFilterChange: (filter: StatusFilter) => void;
  onTypeFilterChange: (filter: "all" | PostType) => void;
  onNew: () => void;
  onSelect: (post: Post) => void;
  onRefresh: () => void;
}) {
  return (
    <main className="min-h-[calc(100dvh-4rem)] px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
            <p className="mt-1 text-sm text-muted-foreground">{counts.total} posts · {counts.draft} drafts · {counts.published} published</p>
          </div>
          <Button onClick={onNew}><Plus className="h-4 w-4" />New post</Button>
        </header>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search posts" className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={(value) => onStatusFilterChange(value as StatusFilter)}>
            <SelectTrigger className="w-full sm:w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={(value) => onTypeFilterChange(value as "all" | PostType)}>
            <SelectTrigger className="w-full sm:w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="blog">Blog</SelectItem>
              <SelectItem value="project">Project</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={onRefresh} disabled={loading} aria-label="Refresh posts" title="Refresh posts">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border bg-card">
          <div className="hidden grid-cols-[minmax(0,1fr)_110px_110px_120px] gap-4 border-b bg-muted/30 px-4 py-2.5 text-xs font-medium text-muted-foreground md:grid">
            <span>Title</span><span>Type</span><span>Status</span><span>Updated</span>
          </div>
          {loading ? (
            <div className="py-20 text-center text-sm text-muted-foreground">Loading posts…</div>
          ) : filteredPosts.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm font-medium">No posts found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try different filters or create a new post.</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredPosts.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => onSelect(post)}
                  className="grid w-full gap-2 px-4 py-3.5 text-left transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring md:grid-cols-[minmax(0,1fr)_110px_110px_120px] md:items-center md:gap-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{post.title || "Untitled"}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{post.excerpt || `${post.cells.length} cells`}</p>
                  </div>
                  <span className="text-xs capitalize text-muted-foreground">{post.type}</span>
                  <Badge variant={post.status === "published" ? "default" : "secondary"} className="w-fit text-[10px]">{post.status}</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(post.updatedAt || post.createdAt).toLocaleDateString()}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function EditorCanvas({
  post,
  selectedCellId,
  onChange,
  onCellSelect,
  onRequestMedia,
}: {
  post: Post;
  selectedCellId: string | null;
  onChange: (post: Post) => void;
  onCellSelect: (cellId: string | null) => void;
  onRequestMedia: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-8 sm:px-8 lg:py-10">
      <VisualEditor
        post={post}
        onChange={onChange}
        showMetadata={false}
        selectedCellId={selectedCellId}
        onCellSelect={onCellSelect}
        onRequestMedia={onRequestMedia}
      />
    </div>
  );
}

function EditorOutlineRail({ post, selectedCellId, onSelect }: { post: Post; selectedCellId: string | null; onSelect: (cellId: string) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Outline</p>
        <span className="text-xs tabular-nums text-muted-foreground">{post.cells.length}</span>
      </div>
      <div className="mt-3 space-y-1">
        {post.cells.length === 0 ? (
          <p className="px-2 py-4 text-xs text-muted-foreground">No cells yet.</p>
        ) : post.cells.map((cell, index) => (
          <button
            key={cell.id}
            type="button"
            onClick={() => onSelect(cell.id)}
            aria-current={selectedCellId === cell.id ? "true" : undefined}
            className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selectedCellId === cell.id ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}
          >
            <span className="w-5 shrink-0 font-mono text-[10px] tabular-nums opacity-60">{String(index + 1).padStart(2, "0")}</span>
            <span className="min-w-0 flex-1 truncate">{getCellLabel(cell, index)}</span>
            <span className="text-[10px] uppercase opacity-50">{cell.type === "markdown" ? "md" : cell.type}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function EditorInspector({
  post,
  panel,
  token,
  issues,
  onPanelChange,
  onChange,
  onDelete,
  onInsert,
  onUseAsThumbnail,
}: {
  post: Post;
  panel: DashboardPanel;
  token: string | null;
  issues: ValidationIssue[];
  onPanelChange: (panel: DashboardPanel) => void;
  onChange: (updater: (post: Post) => Post) => void;
  onDelete: () => void;
  onInsert: (file: FileRecord) => void;
  onUseAsThumbnail: (file: FileRecord) => void;
}) {
  return (
    <div>
      <div className="sticky top-0 z-10 grid grid-cols-4 border-b bg-background/95 p-2 backdrop-blur">
        {(["settings", "media", "validation", "json"] as DashboardPanel[]).map((item) => (
          <Button key={item} variant={panel === item ? "secondary" : "ghost"} size="sm" onClick={() => onPanelChange(item)} className="h-8 px-1 text-xs capitalize">
            {item === "validation" ? "Checks" : item}
          </Button>
        ))}
      </div>
      <div className="p-4">
        {panel === "settings" && <SettingsPanel post={post} onChange={onChange} onDelete={onDelete} />}
        {panel === "media" && <MediaPanel token={token} onInsert={onInsert} onUseAsThumbnail={onUseAsThumbnail} />}
        {panel === "validation" && <ValidationPanel issues={issues} />}
        {panel === "json" && <JsonPanel post={post} />}
      </div>
    </div>
  );
}

function MediaPanel({
  token,
  onInsert,
  onUseAsThumbnail,
}: {
  token: string | null;
  onInsert: (file: FileRecord) => void;
  onUseAsThumbnail: (file: FileRecord) => void;
}) {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "video" | "audio" | "document">("all");
  const [loading, setLoading] = useState(false);

  const loadFiles = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/files`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setFiles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load files:", error);
      toast.error("Failed to load files");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const filteredFiles = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return files.filter((file) => {
      const fileType = fileTypeFromMime(file.mimeType || "") || "document";
      if (typeFilter !== "all" && fileType !== typeFilter) return false;
      if (!needle) return true;
      return `${file.originalName} ${file.mimeType} ${file.key || ""}`.toLowerCase().includes(needle);
    });
  }, [files, query, typeFilter]);

  const iconFor = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <ImageIcon className="h-4 w-4" />;
    if (mimeType.startsWith("video/")) return <Video className="h-4 w-4" />;
    if (mimeType.startsWith("audio/")) return <Music className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium">Media</p>
          <p className="text-sm text-muted-foreground">Insert uploaded files.</p>
        </div>
        <Button variant="outline" size="icon" onClick={loadFiles} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
      <div className="mt-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search files" className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as typeof typeFilter)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All files</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="py-10 text-center text-sm text-muted-foreground">Loading files...</div>
        ) : filteredFiles.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">No files found.</div>
        ) : (
          filteredFiles.map((file) => (
            <div key={file.id || file.s3Url} className="rounded-lg border bg-background/60 p-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-muted-foreground">{iconFor(file.mimeType || "")}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium" title={file.originalName}>{file.originalName || file.filename || "File"}</p>
                  <p className="truncate text-xs text-muted-foreground">{file.mimeType}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => onInsert(file)}>Insert</Button>
                {(file.mimeType || "").startsWith("image/") && <Button size="sm" variant="outline" onClick={() => onUseAsThumbnail(file)}>Thumbnail</Button>}
                <Button size="icon" variant="ghost" onClick={() => { navigator.clipboard.writeText(file.s3Url); toast.success("Copied URL"); }} title="Copy URL">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => window.open(file.s3Url, "_blank", "noopener,noreferrer")} title="Open file">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SettingsPanel({ post, onChange, onDelete }: { post: Post; onChange: (updater: (post: Post) => Post) => void; onDelete: () => void }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="font-medium">Settings</p>
        <p className="text-sm text-muted-foreground">Post metadata.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={post.type} onValueChange={(type) => onChange((current) => ({ ...current, type: type as PostType }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="blog">Blog</SelectItem>
              <SelectItem value="project">Project</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={post.status} onValueChange={(status) => onChange((current) => ({ ...current, status: status as Post["status"] }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-lg border p-3">
        <Label>Featured</Label>
        <Switch checked={post.featured} onCheckedChange={(featured) => onChange((current) => ({ ...current, featured }))} />
      </div>
      <div className="space-y-2">
        <Label>Excerpt</Label>
        <Input value={post.excerpt || ""} onChange={(event) => onChange((current) => ({ ...current, excerpt: event.target.value }))} placeholder="Short summary" />
      </div>
      <Separator />
      <div className="space-y-2">
        <Label>Thumbnail URL</Label>
        <Input value={post.thumbnail?.url || ""} onChange={(event) => onChange((current) => ({ ...current, thumbnail: { url: event.target.value, alt: current.thumbnail?.alt || "" } }))} placeholder="https://..." />
      </div>
      <div className="space-y-2">
        <Label>Thumbnail alt</Label>
        <Input value={post.thumbnail?.alt || ""} onChange={(event) => onChange((current) => ({ ...current, thumbnail: { url: current.thumbnail?.url || "", alt: event.target.value } }))} placeholder="Description" />
      </div>
      {!post.id.startsWith("local-") && (
        <>
          <Separator />
          <Button variant="destructive" className="w-full" onClick={onDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete post
          </Button>
        </>
      )}
    </div>
  );
}

function ValidationPanel({ issues }: { issues: ValidationIssue[] }) {
  return (
    <div>
      <p className="font-medium">Checks</p>
      {issues.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">No warnings.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {issues.map((issue, index) => (
            <div key={`${issue.message}-${index}`} className="rounded-md border p-3 text-sm">
              <Badge variant={issue.level === "error" ? "destructive" : "secondary"} className="mb-2">{issue.level}</Badge>
              <p>{issue.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function JsonPanel({ post }: { post: Post }) {
  const json = JSON.stringify(post, null, 2);
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium">JSON</p>
        <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(json); toast.success("Copied JSON"); }}>Copy</Button>
      </div>
      <pre className="mt-4 overflow-auto rounded-lg bg-muted p-3 text-xs"><code>{json}</code></pre>
    </div>
  );
}

function PostPreview({ post, compact = false }: { post: Post; compact?: boolean }) {
  return (
    <article className={`mx-auto w-full max-w-3xl space-y-6 ${compact ? "p-4 lg:p-6" : "p-6 lg:p-10"}`}>
      <header className="space-y-3 border-b pb-6">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{post.type}</Badge>
          <Badge variant={post.status === "published" ? "default" : "secondary"}>{post.status}</Badge>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">{post.title || "Untitled"}</h1>
        {post.excerpt && <p className="text-lg text-muted-foreground">{post.excerpt}</p>}
      </header>
      <div className="space-y-8">
        {post.cells.length ? post.cells.map((cell) => <PostCell key={cell.id} cell={cell} />) : <p className="text-muted-foreground">No cells yet.</p>}
      </div>
    </article>
  );
}
