import { posts } from "@/data/posts";
import { PostsApi } from "@/lib/posts-api";
import { PostCard } from "@/components/post/post-card";

const processedPosts = PostsApi.processStaticPosts(posts);

export default function BlogPage() {
  const publishedPosts = processedPosts.filter(
    (post) => post.status === "published" && post.type === "blog"
  );

  return (
    <div className="mx-auto w-full max-w-5xl py-6 md:py-12">
      <header className="mb-12 max-w-3xl space-y-4 md:mb-16">
        <h1 className="text-5xl font-black leading-none tracking-[-0.06em] md:text-7xl">
          Blog
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
          Posts by Surya Narayanan.
        </p>
      </header>

      <section aria-label="Blog posts" className="grid">
        {publishedPosts.length > 0 ? (
          publishedPosts.map((post) => (
            <PostCard key={post.id} post={post} variant="compact" />
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
            No posts yet.
          </div>
        )}
      </section>
    </div>
  );
}
