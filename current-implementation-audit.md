# Current implementation audit

## Entry points

### `app/(pages)/admin/posts/page.tsx`

- Client page wrapped in `ProtectedRoute`.
- Uses `useAuth()` to get `token` and configure `postsApi`.
- Shows admin dashboard stats before the actual post manager:
  - total posts
  - published posts
  - draft posts
  - featured posts
  - API/AWS status cards
  - quick actions
- Renders `PostsManager authToken={token} isAdmin={true}`.

Observation: useful status information exists, but it pushes the editor down. For an authoring workflow, the primary surface should be posts and editing, not AWS service cards.

## Posts manager

### `components/post/posts-manager.tsx`

Responsibilities mixed into one large component:

- fetch and filter posts
- create/edit metadata form dialog
- delete posts
- view post modal
- visual editor modal
- dirty-state tracking
- close confirmation
- post list rendering

Current flow:

1. User opens admin posts.
2. User clicks `Create Post`.
3. A large modal collects metadata only.
4. On successful create, browser `confirm()` asks whether to open visual editor.
5. Visual editor opens in a separate full-screen dialog.
6. Saving happens manually from dialog header.

Issues:

- Creation and writing are split, so starting a post has friction.
- `confirm()` feels rough and interrupts flow.
- Two edit modes exist: metadata edit and visual editor.
- Visual editor is trapped in a modal instead of being a stable workspace route/state.
- Preview opens another modal and closes the editor state path in one branch.
- Component is too broad; changes are risky because data, dialogs, UI, fetch, and mutation logic are tangled.
- No pagination/search on posts list beyond filters.
- No local recovery/autosave drafts.
- Dirty detection uses full `JSON.stringify` comparison; works for simple data but is coarse and can be expensive for long posts.

## Visual editor

### `components/editor/visual-editor.tsx`

Current features:

- Edits title, thumbnail, type.
- Edits ordered cells.
- Uses `@dnd-kit` for drag reorder.
- Supports keyboard sensor for sortable behavior.
- Adds markdown cells only via `Add Cell`.
- Supports type conversion among markdown/image/video.

Current cell editor:

- Each cell is a card.
- Drag handle sits outside the card.
- Cell type select always visible.
- Delete button always visible.
- Markdown uses `MarkdownEditor`.
- Image/video cells require manual URL input.
- File cells exist in the data model and renderer but are not first-class in this editor.

Issues:

- `Cell.type` allows `file`, but `handleTypeChange` only supports markdown/image/video.
- `handleContentChange` type excludes `FileContent`.
- Add cell always appends at the end; no insert between cells.
- No duplicate, split, merge, move up/down, or quick transform.
- No collapsed mode for long posts.
- No cell-level validation or warnings.
- No media picker integration despite `/admin/files` existing.
- All markdown editing happens in isolated tabbed editors, making the post feel like many forms rather than one document.
- Current internal sync uses `isUpdatingInternally` state to bounce local updates to parent; this adds complexity and potential stale update edge cases.

## Markdown editor

### `components/editor/markdown-editor.tsx`

Current features:

- Template buttons for headings, bold, italic, link, image, list, code, and callouts.
- Write/Preview tabs.
- Preview reuses `MarkdownCell`, so rendering is close to public output.
- Inserts templates at cursor.

Issues:

- Templates are always visible; toolbar consumes space and feels generic.
- Preview is per-cell only, not whole-post or side-by-side.
- No keyboard shortcuts for common formatting.
- No live stats: words, characters, read time.
- No markdown lint/warnings.
- No slash command insertion.
- Cursor insertion has a simple offset assumption that can be wrong when adding newlines around selections.

## Rendering pipeline

### Types: `types/post.ts`

```ts
interface Post {
  title: string;
  slug?: string;
  cells: Cell[];
  thumbnail?: ImageContent;
  status: "published" | "draft";
  featured: boolean;
  type: PostType;
  id: string;
  createdAt: string;
  updatedAt: string;
  excerpt?: string;
  viewCount?: number;
}

interface Cell {
  id: string;
  type: "markdown" | "image" | "video" | "file";
  content: string | ImageContent | VideoContent | FileContent;
  order?: number;
}
```

Supported renderer cells:

- `markdown` → `MarkdownCell`
- `image` → `ImageCell`
- `video` → `VideoCell`
- `file` → `FileCell`

Important: `file` cells are more expressive than image/video cells because they can represent S3-backed image, video, audio, or document attachments with display settings and captions.

## Frontend API client

### `lib/posts-api.ts`

- `createPost(postData)` → `POST /posts`.
- `updatePost(id, updateData)` → `PUT /posts/{id}`.
- `listPosts(filters)` → `GET /posts?...`.
- `getPost(id)` → `GET /posts/{id}`.
- Auth token is stored on singleton via `setAuthToken`.
- Post content processing normalizes escaped markdown and parses JSON-encoded content for non-markdown cells.

Notable behavior:

- `CreatePostData.cells` does not include `id`, only `{ type, content }`.
- `UpdatePostData` extends `CreatePostData`, but the UI currently sends a full `Post` object in some paths.
- API client is forgiving because backend ignores unknown top-level fields during update.

## Backend contract

### `functions/aws/db.js`

DynamoDB layout:

- Post item:
  - `PK = POST#<postId>`
  - `SK = POST`
  - metadata fields such as title, slug, status, featured, type, thumbnail, excerpt, timestamps
- Cell item:
  - `PK = POST#<postId>`
  - `SK = CELL#001`, `CELL#002`, ...
  - `id = generated id`
  - `cell_type = cell.type`
  - `content = JSON.stringify(cell.content)`
  - `order_index = i + 1`

Update behavior:

- Metadata is updated with a DynamoDB update expression.
- If `postData.cells !== undefined`, all existing cell items are deleted and recreated.
- New cell ids are generated on each update; frontend cell ids are not preserved by backend storage.
- Order is defined by array position and stored as `order_index`.

Implications:

- The frontend should not rely on persisted cell ids for durable identity across saves.
- For editor-local React identity, keep local ids stable while editing, but expect API reload to return generated ids.
- Reordering must send the full cells array in final desired order.
- Do not send partial cell patches unless backend changes are planned.

### `functions/aws/posts-create.js` / `posts-update.js`

- Auth required for create/update.
- Valid post types: `project`, `blog`.
- Valid statuses: `draft`, `published`.
- Create requires title.
- Create returns transformed post and echoes `postData.cells || []`.
- Update returns transformed shape but many fields come from a minimal db result, so several metadata fields may be undefined in the response; current UI mostly updates local list manually.

Risk: If future editor trusts update response as the full canonical post, it may lose data in UI state. Prefer keeping the local saved draft as source after a successful update, then reload in background if needed.

## Files/media integration

### Current file admin

- `components/files/file-browser.tsx` fetches `GET /files` using auth token.
- File cards now show inline image/video/audio/document previews and pagination.
- Files expose `s3Url`, `originalName`, `mimeType`, `size`, etc.

Opportunity:

- Reuse file fetch logic in the post editor as a media picker.
- Inserting media should create a `file` cell by default for S3 assets, not a markdown image string.
- For direct external image/video URLs, keep `image` and `video` cells available.

## Summary of problems to solve

1. Editor is modal-heavy and split into metadata vs content flows.
2. File cells are supported by data/rendering but not by the editor.
3. Media insertion relies on manual URL copy/paste.
4. No draft recovery or autosave safety.
5. Whole-post preview is separate and interrupts editing.
6. Long posts will become difficult to navigate without an outline/collapse model.
7. Component responsibilities need separation before heavy UX work.
8. Backend cell updates are full-array replacement; the editor must treat save as a full document serialization step.
