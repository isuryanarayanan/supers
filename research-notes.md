# Research notes

## Product patterns worth borrowing

### Slash commands

Sources: Craft slash menu docs, Notion keyboard shortcuts.

Useful pattern:

- type `/` while writing to open a searchable command menu
- filter commands as the user types
- use arrow keys and Enter to select
- Esc closes the menu
- commands insert blocks, transform blocks, or apply formatting

What to borrow for Supers:

- `/md`, `/image`, `/video`, `/file`, `/code`, `/quote`, `/callout`, `/table`
- Context-aware actions: inside a markdown cell, commands insert markdown snippets; between cells, commands create cells.
- Keep it simple. Supers does not need Notion-level nested pages/databases.

### Progressive disclosure

Good editors keep the default state simple and reveal tools when focused.

What to borrow:

- Show cell controls on hover/focus/selection.
- Keep metadata in a panel, not always in the writing flow.
- Keep JSON as advanced/debug panel.

### Split preview and local drafts

Sources: markdown editor research snippets.

Common useful features:

- edit / split / preview modes
- live rendered preview
- debounced local autosave
- visible saved/unsaved state
- markdown export/copy
- word count and read time
- recover draft after reload

What to borrow:

- Local recovery is separate from API save.
- Preview should not force the user out of editing.
- Status line should be plain: words, cells, last saved.

### Structured content editors

Sources: Portable Text/Sanity editor docs.

Relevant pattern:

- Keep content as data, not just HTML.
- Use custom block objects for media and other non-text content.
- Customize toolbars and block controls around the schema.

What to borrow:

- Supers already has a simple version of structured content: ordered cells.
- Do not convert to Portable Text; just use the idea of schema-aware editing.
- File/media cells should be first-class objects with their own controls.

## What not to borrow

- Heavy nested block systems.
- Realtime collaboration.
- AI UI.
- Databases, reminders, backlinks, comments.
- Decorative editor chrome.

This is a single-user personal site editor. It should be straightforward.

## Editor requirements distilled

- Fast start: create a draft and start typing immediately.
- Keep cells visible and reorderable.
- Insert media from existing S3 uploads.
- Preview the actual public renderer.
- Save explicitly to API.
- Recover local unsaved work.
- Make raw JSON available but not central.
- Do not mutate content into a new format.
