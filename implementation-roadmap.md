# Implementation roadmap

## Phase 0 — safety and cleanup

- [ ] Add runtime helpers for post/cell normalization before save.
- [x] Add `FileContent` support to `VisualEditor` types and controls.
- [x] Stop sending full unknown post fields to update; send an explicit update payload.
- [ ] Do not trust update response as a full post object; keep local saved state after success.
- [ ] Replace browser `confirm()` calls with controlled dialogs/toasts.
- [ ] Extract post-list and editor modal code out of `PostsManager` before large UX changes.

Deliverable: no UX overhaul yet, just safer internals.

## Phase 1 — unified editor shell

- [ ] Create `PostEditorShell` used for both new and existing posts.
- [ ] Start new posts directly in the editor with a blank draft instead of metadata-only create modal.
- [ ] Move metadata to an inspector panel.
- [ ] Keep top bar sticky with back/close, save state, preview mode, and publish/draft state.
- [ ] Keep raw JSON drawer.

Deliverable: one editor workspace, still using existing cell editors internally.

## Phase 2 — better cell operations

- [x] Add insert buttons between cells.
- [x] Add add-menu with markdown/image/video/file.
- [x] Add duplicate cell.
- [x] Add move up/down buttons for mobile and keyboard users.
- [ ] Add collapse/expand for long cells.
- [ ] Add selected-cell state.
- [ ] Add keyboard shortcuts for save, duplicate, move, preview.
- [ ] Add undo toast after delete.

Deliverable: cells feel controllable without relying only on drag-and-drop.

## Phase 3 — markdown writing improvements

- [ ] Replace always-visible template buttons with compact toolbar + slash menu.
- [ ] Add keyboard formatting shortcuts: bold, italic, link, inline code, code fence.
- [ ] Add word/character/read-time status.
- [ ] Add split preview mode for current markdown cell or whole post.
- [ ] Add markdown snippets that match supported renderer features.
- [ ] Keep markdown as plain string; no rich-text data migration.

Deliverable: writing markdown feels fast and does not fight the user.

## Phase 4 — media picker and file cells

- [x] Create reusable media picker dialog that fetches `/files` with auth.
- [ ] Support search, type filters, pagination/virtualization.
- [x] Insert selected S3 asset as a `file` cell by default.
- [ ] Add actions: use as thumbnail, copy URL, open file, insert below selected cell.
- [x] Add `FileCellEditor` for caption, display type, file type, name, size, URL.
- [ ] Preserve direct image/video cell editors for external URLs.

Deliverable: uploaded media can be used in posts without manual open/copy/paste.

## Phase 5 — preview and validation

- [ ] Whole-post preview pane using public `PostCell` renderers.
- [ ] Edit / Split / Preview modes.
- [ ] Remember panel layout in local storage.
- [ ] Add validation warnings for title, empty post, empty cells, missing URLs, unsupported providers.
- [ ] Add publish confirmation only when warnings exist.

Deliverable: author sees exactly what will render before saving/publishing.

## Phase 6 — local recovery

- [ ] Add debounced local draft snapshots keyed by post id/temp id.
- [ ] Show restore/discard prompt when local draft is newer than server data.
- [ ] Track local saved time and server saved time separately.
- [ ] Add JSON export/import for recovery and advanced edits.

Deliverable: accidental refresh/navigation does not lose work.

## Phase 7 — post list QoL

- [ ] Simplify `/admin/posts` header and reduce dashboard noise.
- [ ] Add search across title/excerpt/type/status.
- [ ] Add pagination.
- [ ] Add quick status filter tabs.
- [ ] Add row/card actions: edit, preview, duplicate, delete.
- [ ] Add visible cell count and last updated time.

Deliverable: managing existing posts is fast.

## Phase 8 — validation and deployment

- [ ] Unit-test normalization/validation helpers.
- [ ] Build check: `corepack pnpm run build`.
- [ ] Manual smoke test with existing production API.
- [ ] Verify no post data format drift by comparing saved payload to `types/post.ts` contract.
- [ ] Ask backend agent to deploy Pages with manual branch fallback.

## First implementation slice recommendation

Start with Phase 0 + part of Phase 4:

1. [x] Add `file` cell support to the current `VisualEditor`.
2. [x] Add a small media picker dialog that lists files and inserts a selected file cell.
3. [x] Add insert-below and duplicate cell controls.
4. Keep existing modals until the data path is safe.

This gives immediate QoL without risking a large rewrite.
