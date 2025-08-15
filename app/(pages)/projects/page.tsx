import { posts } from "@/data/posts";
import { PostCard } from "@/components/post/post-card";

export default function ProjectsPage() {
  const publishedPosts = posts.filter(
    (post) => post.status === "published" && post.type === "project"
  );

  return (
    <div className="flex flex-col gap-12 md:gap-16">
      <section>
        <h1 className="text-4xl font-bold tracking-tight mb-12 md:mb-16">
          Projects
        </h1>
        <div className="grid gap-8 md:gap-10">
          {publishedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}
