import { posts } from "@/data/posts";
import { PostCard } from "@/components/post/post-card";

export default function GeneralPage() {
  const generalPosts = posts.filter(
    (post) => post.status === "published" && post.type === "general"
  );

  return (
    <div className="flex flex-col gap-12 md:gap-16">
      <section>
        <h1 className="text-4xl font-bold tracking-tight mb-12 md:mb-16">
          Other Writings
        </h1>
        <div className="grid gap-8 md:gap-10">
          {generalPosts.map((post) => (
            <PostCard key={post.id} post={post} variant="compact" />
          ))}
        </div>
      </section>
    </div>
  );
}
