# Editor experience brief

## Tone

Plain, personal, utilitarian. No marketing wording. The admin UI should feel like a good tool, not a product landing page.

Use labels such as:

- Posts
- New post
- Edit
- Draft
- Publish
- Preview
- Save
- Cells
- Media
- Settings

Avoid wording like "ultimate", "seamless publishing experience", "crisp notes", or similar.

## UX principles

### 1. One writing workspace

Creating, editing metadata, editing cells, previewing, and publishing should happen in one full-screen workspace, not a chain of modals.

Suggested routes/states:

- `/admin/posts` — list/search/filter posts.
- `/admin/posts/new` or full-screen editor state — create a blank draft and start editing immediately.
- `/admin/posts/:id/edit` or dialog-free editor panel — edit an existing post.

Static export may limit dynamic admin routes depending on current app config, so this can also be implemented as a full-page client state under `/admin/posts` first. The important point is that the editor should feel like a stable page, not a temporary popup.

### 2. Cells stay visible but not noisy

Each cell should have:

- compact type badge
- drag handle
- insert-above / insert-below affordance
- duplicate
- delete with confirmation or undo toast
- collapse/expand
- validation state

Only show secondary controls on hover/focus or when a cell is selected.

### 3. Fast insertion

Support both pointer and keyboard flows:

- Click `+` between cells to insert there.
- Empty markdown cell can type `/` to open command menu.
- Keyboard shortcuts:
  - `Cmd/Ctrl+S` save
  - `Cmd/Ctrl+Shift+P` preview
  - `Cmd/Ctrl+Enter` save or publish action depending focus/context
  - `Esc` close menus
  - `Cmd/Ctrl+D` duplicate selected cell
  - `Cmd/Ctrl+Shift+ArrowUp/Down` move selected cell

Slash menu inspirations from Craft and Notion: commands should be searchable, keyboard navigable, and context-aware. This does not mean copying their visual style.

### 4. Media picker is part of writing

The existing file browser should feed the editor.

Add a right-side Media panel:

- search files
- filter images/videos/audio/documents
- pagination or virtual list
- inline thumbnails/previews
- `Insert as file cell`
- `Use as thumbnail`
- `Copy URL`

Default mapping for S3 files:

- image MIME → `file` cell with `fileType: "image"`, `displayType: "inline"`
- video MIME → `file` cell with `fileType: "video"`, `displayType: "inline"`
- audio MIME → `file` cell with `fileType: "audio"`, `displayType: "inline"`
- pdf/text/other → `file` cell with `fileType: "document"`, `displayType: "attachment"`

Keep direct `image` and `video` cells available for non-S3 URLs.

### 5. Preview without losing place

View modes:

- Edit — full width cells.
- Split — editor left, rendered post preview right.
- Preview — rendered post only.

For long posts, preview should be scrollable and not destroy editor state. Split pane width should be resizable and remembered in local storage.

### 6. Local recovery

Unsaved work should survive refresh and accidental navigation.

Use local storage or IndexedDB draft snapshots keyed by post id:

```txt
supers:post-editor:draft:<postId>
supers:post-editor:autosave:<postId>
supers:post-editor:layout
```

Behavior:

- Debounce local draft writes, e.g. 500ms.
- Show `Saved locally` vs `Saved to server` separately.
- On opening a post, if a newer local draft exists, offer restore/discard/compare.
- Manual API save remains explicit.

This follows common markdown editor patterns: local autosave for recovery, explicit server save for publishing confidence.

### 7. Guardrails before save

Show a validation panel or top-bar warnings:

- title missing
- published post with no cells
- image/file missing alt/caption where helpful
- broken/empty URLs
- unsupported video provider
- empty cells
- thumbnail URL without alt text

Warnings should not block drafts. Publishing can require stricter checks if desired.

### 8. Raw JSON stays available

Keep raw JSON inspection and copy/export because it gives full control and debugging confidence. It should be a drawer/panel, not the primary path.

Add:

- copy JSON
- download JSON
- validate JSON against current TypeScript-shaped runtime schema
- optional advanced import JSON, gated behind explicit confirmation

## Proposed layout

```txt
┌──────────────────────────────────────────────────────────────────────┐
│ Back  Title field...                         Draft  Save  Preview   │
├───────────────┬──────────────────────────────────────┬───────────────┤
│ Outline       │ Cells                                │ Inspector     │
│ - Intro       │ + insert                             │ Settings      │
│ - Image       │ [markdown cell]                      │ Thumbnail     │
│ - Section     │ + insert                             │ Media         │
│               │ [file/image/video cell]              │ JSON          │
│               │ + insert                             │ Validation    │
└───────────────┴──────────────────────────────────────┴───────────────┘
```

Responsive:

- Desktop: three columns with collapsible sidebars.
- Tablet: editor + drawer inspector.
- Mobile: single column with bottom action bar; no complex drag requirement, provide move up/down buttons.

## Component split

Target components:

```txt
components/editor/post-editor-shell.tsx
components/editor/post-editor-state.ts
components/editor/post-editor-toolbar.tsx
components/editor/post-metadata-panel.tsx
components/editor/cell-list.tsx
components/editor/cell-frame.tsx
components/editor/cell-editors/markdown-cell-editor.tsx
components/editor/cell-editors/image-cell-editor.tsx
components/editor/cell-editors/video-cell-editor.tsx
components/editor/cell-editors/file-cell-editor.tsx
components/editor/media-picker-panel.tsx
components/editor/post-preview-pane.tsx
components/editor/post-json-panel.tsx
components/editor/post-validation.ts
components/editor/use-local-post-draft.ts
```

## Why this fits Supers

- It keeps the current durable model.
- It reuses public renderers for preview.
- It reuses existing auth and API client.
- It integrates the now-improved file browser instead of duplicating upload work.
- It lets a single author move fast without CMS complexity.
