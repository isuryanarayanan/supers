# Backend API notes

Integrated from backend agent reply: `post-editor-api-contract-retry-20260906`.

## API base

- Base URL comes from `NEXT_PUBLIC_API_BASE_URL`.
- Current prod API: `https://zrzucmu4zl.execute-api.ap-south-1.amazonaws.com/prod`.

## Post endpoints

- `GET /posts` — public.
- `GET /posts/{id}` — public; increments `view_count` for published posts.
- `POST /posts` — requires `Authorization: Bearer <jwt>`.
- `PUT /posts/{id}` — requires `Authorization: Bearer <jwt>`.
- `DELETE /posts/{id}` — requires `Authorization: Bearer <jwt>`.

## Create post contract

`POST /posts`

- JSON body.
- Required: `title`.
- Optional: `id`, `slug`, `status`, `featured`, `type`, `thumbnail`, `excerpt`, `authorId`, `cells`.
- `status`: `draft` or `published`; default `draft`.
- `type`: `project` or `blog`; default `blog`.
- `slug` generated from title if omitted.
- `id` generated if omitted.
- Success: status `201`, body:

```json
{
  "success": true,
  "data": "transformedPost",
  "message": "Post created successfully"
}
```

## Update post contract

`PUT /posts/{id}`

- JSON body.
- Path param: `id`.
- Optional fields: `title`, `status`, `featured`, `type`, `thumbnail`, `excerpt`, `cells`.
- If `cells` is omitted, existing cells remain unchanged.
- If `cells` is present, backend deletes all existing cells and recreates them from submitted array order.
- Important: `postQueries.updatePost` currently returns only `{ id, message, updated_at }`; the handler transforms that partial object. The editor must not rely on PUT response as a complete post. Keep local saved state or refetch if canonical data is needed.

## List/get contract

`GET /posts?status=&type=&featured=&limit=`

- Backend applies `status` and `limit` in db query.
- Handler parses `type` and `featured`, but current `db.js` does not apply those filters. Filter client-side unless backend is fixed.
- Default list status is `published`.
- List response: `{ success: true, data: Post[], count: number }`.
- `GET /posts/{id}` accepts id-like or slug-like identifier.
- Slug lookup only searches published posts through `CreatedAtIndex`; drafts by slug will not work.

## DynamoDB model

- Table: `DYNAMODB_TABLE_NAME`, prod currently `Supers-Posts`.
- Post item:
  - `PK=POST#{postId}`
  - `SK=POST`
  - fields: `id`, `title`, `slug`, `status`, `featured`, `type`, `thumbnail_url`, `thumbnail_alt`, `excerpt`, `author_id`, `created_at`, `updated_at`, `view_count`
- Cell item:
  - `PK=POST#{postId}`
  - `SK=CELL#001`, `CELL#002`, etc.
  - fields: `id`, `post_id`, `cell_type`, `content`, `order_index`
- Required index: `CreatedAtIndex` with `status` partition and `created_at` sort key.

## Cell serialization

- Frontend cell shape: `Cell { id, type, content, order? }`.
- Supported types: `markdown`, `image`, `video`, `file`.
- Backend ignores submitted `cell.id` and generates new cell ids on create/update.
- Backend ignores submitted `order`; submitted array position defines order.
- Backend stores `content = JSON.stringify(cell.content)`.
- Backend read paths return stored content, usually a JSON string. Frontend normalizes/parses it.

## Supported content shapes

```ts
type MarkdownCell = {
  type: "markdown";
  content: string;
};

type ImageCell = {
  type: "image";
  content: { url: string; alt: string };
};

type VideoCell = {
  type: "video";
  content: {
    url: string;
    title: string;
    provider?: "youtube" | "vimeo" | "direct";
  };
};

type FileCell = {
  type: "file";
  content: {
    s3Url: string;
    displayType?: "inline" | "attachment" | "gallery";
    caption?: string;
    fileType?: "image" | "video" | "audio" | "document";
    originalName?: string;
    size?: number;
  };
};
```

## Files/media API

- File endpoints require auth.
- `GET /files` returns S3 objects as `{ id, key, originalName, size, mimeType, uploadedAt, s3Url, metadata }`.
- `GET /files` uses S3 `ListObjectsV2` with `MaxKeys=1000`; pagination is currently frontend-only.
- `POST /files/presigned-url` body: `{ filename, contentType, size }`.
- Presigned response: `{ uploadUrl, fileId, filename, contentType, size, uploadedBy, createdAt, url }`.
- Client uploads bytes directly to S3 with `PUT uploadUrl` and `Content-Type`.
- `POST /files/upload` exists for small multipart uploads.
- Upload utility uses direct Lambda upload for files `<=5MB` and presigned S3 upload for larger files.
- Store public S3 URLs in post cells. Never store file bytes in post/cell content.

## Limits

- Backend max upload size: `MAX_FILE_SIZE=1073741824` bytes / 1GB.
- Frontend max upload size: `NEXT_PUBLIC_MAX_FILE_SIZE=1073741824` bytes / 1GB.
- Allowed file types: `image/*`, `video/*`, `audio/*`, `application/pdf`, `text/*`.
- DynamoDB item limit is 400KB per item. Each individual cell content must stay below that. Large media belongs in S3.
- Presigned PUT validates declared size before URL issuance, but S3 PUT URL does not strictly enforce content-length range. Strict S3-side size enforcement would need presigned POST.

## Risks for editor redesign

- Backend accepts only `project` and `blog`.
- Backend accepts only `draft` and `published`.
- Cell updates are replace-all; concurrent saves can drop/reorder cells.
- No optimistic locking/version check; last write wins.
- Cell ids are regenerated on save; do not treat them as durable references.
- No backend cell schema validation; editor must validate by cell type before saving.
- `GET /posts/{slug}` only finds published posts by slug.
- Public `GET /posts/{id}` increments view count for published posts, so editor preview/refetch should avoid unnecessary public GETs where possible.

## Backend recommendations

Frontend editor should:

- Preserve existing JSON request/response shapes.
- Send the full ordered cells array on content save.
- Refetch after PUT only if canonical data is needed; otherwise keep local saved state.
- Validate type/status and each cell content before save.
- Treat S3 file browser as a media picker.
- Not rely on durable cell ids.

Potential future backend improvements:

- Return full post on update.
- Apply type/featured filters in `db.js`.
- Add backend cell schema validation.
- Add optimistic concurrency/versioning.
