import { posts } from "@/data/posts";
import { PostCard } from "@/components/post/post-card";

export default function PapersPage() {
  const paperAndArticlePosts = posts.filter(
    (post) =>
      post.status === "published" &&
      (post.type === "paper" || post.type === "article")
  );

  return (
    <div className="flex flex-col gap-12 md:gap-16">
      <section>
        <h1 className="text-4xl font-bold tracking-tight mb-12 md:mb-16">
          Articles and Papers
        </h1>
        <div className="grid gap-8 md:gap-10">
          {paperAndArticlePosts.map((post) => (
            <PostCard key={post.id} post={post} variant="compact" />
          ))}
        </div>
      </section>
    </div>
  );
}
