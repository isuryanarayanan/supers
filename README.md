# Post Editor Lab

Rethink the Supers admin post editor as a calm, fast writing workspace for a personal site.

The goal is not to replace the content model. Posts must still be made from ordered cells. The editor should make that structure feel natural: type, add media, reorder, preview, save, publish, and recover work without thinking about JSON or backend details.

## Current focus

- Keep `Post` and `Cell` formats stable.
- Make the editor feel direct, predictable, and safe.
- Integrate uploaded S3 media into post cells without copy/paste friction.
- Give full control over metadata, cells, ordering, previews, and raw JSON inspection.
- Avoid cheesy product copy; this is a personal website admin tool.

## Research artifacts

- `current-implementation-audit.md` — how posts/editor/files/API currently work.
- `editor-experience-brief.md` — target UX and principles.
- `data-contract.md` — formats that must not break.
- `backend-api-notes.md` — backend/API constraints from the backend agent.
- `implementation-roadmap.md` — phased build plan.

## North star

A single editor screen:

- left/center: ordered cells with focused editing
- right: metadata + outline + file picker/inspector
- top bar: status, save, preview, publish
- keyboard-first: `/` to insert, shortcuts to save/preview/add cells
- local recovery: unsaved edits survive refresh
- data-safe: every edit serializes back to the existing cell format
