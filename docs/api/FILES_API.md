# Files API

- POST /auth/login
- GET /auth/verify
- GET /files
- POST /files/upload
- POST /files/presigned-url
- DELETE /files/{id}

Requires JWT for protected endpoints. Files stored in S3 bucket `AWS_S3_BUCKET_NAME`.
