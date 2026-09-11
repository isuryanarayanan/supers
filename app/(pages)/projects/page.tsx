import { HomeLink } from "@/components/layout/home-link";
import { PostCard } from "@/components/post/post-card";
import { posts } from "@/data/posts";
import { PostsApi } from "@/lib/posts-api";

const processedPosts = PostsApi.processStaticPosts(posts);

export default function ProjectsPage() {
  const publishedPosts = processedPosts.filter(
    (post) => post.status === "published" && post.type === "project"
  );

  return (
    <div className="mx-auto w-full max-w-5xl py-6 md:py-12">
      <div className="mb-10 md:mb-14">
        <HomeLink />
      </div>

      <header className="mb-12 max-w-3xl space-y-4 md:mb-16">
        <h1 className="text-5xl font-black leading-none tracking-[-0.06em] md:text-7xl">
          Projects
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
          Software projects and experiments by Surya Narayanan.
        </p>
      </header>

      <section aria-label="Projects" className="grid">
        {publishedPosts.length > 0 ? (
          publishedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
            No projects yet.
          </div>
        )}
      </section>
    </div>
  );
}
