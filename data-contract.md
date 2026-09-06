# Data contract

This lab must protect the existing Supers data model.

## Post shape

Source of truth: `types/post.ts`, `lib/posts-api.ts`, `functions/aws/db.js`.

```ts
export interface Post {
  title: string;
  slug?: string;
  cells: Cell[];
  thumbnail?: ImageContent;
  status: "published" | "draft";
  featured: boolean;
  type: "project" | "blog";
  id: string;
  createdAt: string;
  updatedAt: string;
  excerpt?: string;
  viewCount?: number;
}
```

Do not rename these fields in the persisted API contract.

## Cell shape

```ts
export interface Cell {
  id: string;
  type: "markdown" | "image" | "video" | "file";
  content: string | ImageContent | VideoContent | FileContent;
  order?: number;
}
```

Cells remain the document structure. The new editor can make editing feel seamless, but the save payload must serialize back to this array.

## Cell content shapes

### Markdown

```ts
{
  id: string;
  type: "markdown";
  content: string;
}
```

Markdown is still plain text. Do not convert markdown cells into rich-text JSON.

### Image

```ts
{
  id: string;
  type: "image";
  content: {
    url: string;
    alt: string;
  };
}
```

Use for direct image URLs or simple images.

### Video

```ts
{
  id: string;
  type: "video";
  content: {
    url: string;
    title: string;
    provider?: "youtube" | "vimeo" | "direct";
  };
}
```

Use for embeds or direct video URLs.

### File

```ts
{
  id: string;
  type: "file";
  content: {
    s3Url: string;
    displayType?: "inline" | "attachment" | "gallery";
    caption?: string;
    fileType?: "image" | "video" | "audio" | "document";
    originalName?: string;
    size?: number;
  };
}
```

Use as the default for S3-backed assets selected from the files page/browser.

## Backend serialization

The backend stores every cell's `content` as `JSON.stringify(cell.content)`.

Consequences:

- Markdown strings are stored as JSON strings and later unescaped by `postsApi.processPostContent`.
- Object content is stored as JSON object strings and later parsed by `postsApi.processPostContent` / `PostCell`.
- The editor should keep object content as objects in React state; only the API/backend should stringify.

## Save contract

Create:

```ts
postsApi.createPost({
  title,
  type,
  status,
  featured,
  excerpt,
  thumbnail,
  cells
})
```

Update:

```ts
postsApi.updatePost(id, {
  title,
  type,
  status,
  featured,
  excerpt,
  thumbnail,
  cells
})
```

Send the full cell array when saving content. Backend update deletes and recreates all cells.

## Editor-local state rules

- Keep a local draft object shaped as `Post`.
- Use stable local `cell.id` values for React rendering and drag interactions while editing.
- Do not assume those ids persist after API save/reload.
- Treat `order` as display metadata only; array order is canonical.
- Normalize before save:
  - remove empty thumbnail object if URL is empty
  - coerce empty excerpt to `""` or omit consistently
  - ensure every cell has a supported type
  - ensure object cell content has required fields

## Compatibility constraints

- No migration required for the first editor rebuild.
- New UI-only metadata must not be sent to API unless backend supports it.
- Any future additions should be optional fields inside existing content objects or ignored UI state in local storage.
- Public renderers must continue to render old saved posts.
