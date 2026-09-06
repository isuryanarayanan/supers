import { notFound } from "next/navigation";
import { posts } from "@/data/posts";
import { PostsApi } from "@/lib/posts-api";
import { PostCell } from "@/components/post/post-cell";
import { ReadingProgress } from "@/components/article/reading-progress";
import { format, formatDistance } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

const processedPosts = PostsApi.processStaticPosts(posts);

type Post = (typeof processedPosts)[number];

function getPost(id: string): Post | undefined {
  return processedPosts.find((p) => p.id === id);
}

function validateAndParseId(rawId: unknown) {
  return typeof rawId === "string" ? rawId : "";
}

function getMarkdownBody(post: Post) {
  return post.cells
    .filter((cell) => cell.type === "markdown" && typeof cell.content === "string")
    .map((cell) => cell.content as string)
    .join("\n\n");
}

function getReadingMinutes(post: Post) {
  const words = getMarkdownBody(post).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function getHeadings(post: Post) {
  return getMarkdownBody(post)
    .split("\n")
    .map((line) => line.match(/^#{2,3}\s+(.+)$/)?.[1]?.replace(/[#`*_]/g, "").trim())
    .filter((heading): heading is string => Boolean(heading))
    .slice(0, 8);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const resolvedId = validateAndParseId(id);
  const post = getPost(resolvedId);

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: `${post.title} — supers`,
    description: post.excerpt,
  };
}

export async function generateStaticParams() {
  if (!processedPosts || processedPosts.length === 0) {
    console.warn("No posts available for generateStaticParams - returning placeholder");
    return [{ id: "placeholder" }];
  }

  const publishedPosts = processedPosts.filter(
    (post) => post.status === "published" && post.id !== "placeholder"
  );

  if (publishedPosts.length === 0) {
    console.warn("No published posts found for generateStaticParams - returning placeholder");
    return [{ id: "placeholder" }];
  }

  return publishedPosts.map((post) => ({ id: post.id }));
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const resolvedId = validateAndParseId(id);

  if (resolvedId === "placeholder") {
    notFound();
  }

  const post = getPost(resolvedId);

  if (!post || post.status !== "published") {
    notFound();
  }

  const relativeDate = formatDistance(new Date(post.updatedAt), new Date(), {
    addSuffix: true,
  });
  const absoluteDate = format(new Date(post.updatedAt), "MMM d, yyyy");
  const readingMinutes = getReadingMinutes(post);
  const headings = getHeadings(post);
  const backHref = post.type === "project" ? "/projects" : "/posts/blog";
  const backLabel = post.type === "project" ? "Projects" : "Blog";

  return (
    <>
      <ReadingProgress />
      <article className="mx-auto w-full max-w-6xl py-6 md:py-12">
        <div className="mb-10 md:mb-16">
          <Button variant="ghost" className="-ml-3 mb-8 text-muted-foreground hover:text-foreground" asChild>
            <Link href={backHref}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {backLabel}
            </Link>
          </Button>

          <div className="grid gap-8 border-b border-border/70 pb-10 md:grid-cols-[1fr_220px] md:gap-12 md:pb-14">
            <header className="max-w-3xl space-y-6">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <span className="rounded-full border border-border/80 px-3 py-1 text-[10px] text-foreground/80">
                  {post.type}
                </span>
                <span>{absoluteDate}</span>
                <span aria-hidden="true">/</span>
                <span>{readingMinutes} min read</span>
              </div>

              <h1 className="text-balance text-4xl font-black leading-[0.98] tracking-[-0.055em] md:text-6xl">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="max-w-2xl text-pretty text-lg leading-8 text-muted-foreground md:text-xl md:leading-9">
                  {post.excerpt}
                </p>
              )}

              <p className="font-mono text-xs text-muted-foreground">
                Updated {relativeDate}
              </p>
            </header>

            <aside className="hidden md:block">
              <div className="sticky top-24 space-y-4 border-l border-border/70 pl-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  In this piece
                </p>
                {headings.length > 0 ? (
                  <ol className="space-y-2 text-sm leading-6 text-muted-foreground">
                    {headings.map((heading) => (
                      <li key={heading} className="line-clamp-2">
                        {heading}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm leading-6 text-muted-foreground">
                    Contents
                  </p>
                )}
              </div>
            </aside>
          </div>
        </div>

        <div className="mx-auto max-w-3xl space-y-12">
          {post.cells.map((cell) => (
            <PostCell key={cell.id} cell={cell} />
          ))}
        </div>
      </article>
    </>
  );
}
