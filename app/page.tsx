import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { PostCard } from "@/components/post/post-card";
import IsovaluesShaderBackground from "@/components/ui/isovalues-shader-background";
import { posts } from "@/data/posts";
import { PostsApi } from "@/lib/posts-api";
import { Post } from "@/types/post";

const processedPosts = PostsApi.processStaticPosts(posts);

function byMostRecentlyUpdated(a: Post, b: Post) {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}

const featuredProjects = processedPosts
  .filter(
    (post) =>
      post.status === "published" && post.type === "project" && post.featured
  )
  .sort(byMostRecentlyUpdated)
  .slice(0, 3);

const featuredPosts = processedPosts
  .filter(
    (post) =>
      post.status === "published" && post.type === "blog" && post.featured
  )
  .sort(byMostRecentlyUpdated)
  .slice(0, 4);

function SectionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      {children}
      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  );
}

export default function Home() {
  return (
    <div className="relative">
      <IsovaluesShaderBackground className="hidden dark:block" />

      <div className="relative z-10">
        <section className="flex min-h-[82svh] items-end py-16 md:min-h-[88svh] md:py-24">
          <div className="max-w-5xl">
            <p className="animate-fade-in-300 mb-6 font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground md:text-xs">
              Surya Narayanan · Kerala, India
            </p>
            <h1 className="animate-fade-in-500 max-w-4xl text-balance text-5xl font-black leading-[0.92] tracking-[-0.07em] md:text-7xl lg:text-8xl">
              I build software and write about the work.
            </h1>
            <p className="animate-fade-in-700 mt-8 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground md:text-xl md:leading-9">
              Software engineer working on backend systems, infrastructure,
              developer tools, and web applications.
            </p>
          </div>
        </section>

        <section
          id="projects"
          aria-labelledby="projects-heading"
          className="grid gap-10 border-t border-border/70 py-16 md:grid-cols-[minmax(0,240px)_minmax(0,1fr)] md:gap-16 md:py-24"
        >
          <header className="space-y-4 md:sticky md:top-8 md:self-start">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              01 / Projects
            </p>
            <h2 id="projects-heading" className="text-3xl font-black tracking-[-0.045em] md:text-4xl">
              Selected work
            </h2>
            <SectionLink href="/projects">View all projects</SectionLink>
          </header>

          <div className="grid gap-6">
            {featuredProjects.length > 0 ? (
              featuredProjects.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <p className="border-t border-border/70 py-8 text-muted-foreground">
                No featured projects yet.
              </p>
            )}
          </div>
        </section>

        <section
          id="writing"
          aria-labelledby="writing-heading"
          className="grid gap-10 border-t border-border/70 py-16 md:grid-cols-[minmax(0,240px)_minmax(0,1fr)] md:gap-16 md:py-24"
        >
          <header className="space-y-4 md:sticky md:top-8 md:self-start">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              02 / Blog
            </p>
            <h2 id="writing-heading" className="text-3xl font-black tracking-[-0.045em] md:text-4xl">
              Recent writing
            </h2>
            <SectionLink href="/posts/blog">View all posts</SectionLink>
          </header>

          <div>
            {featuredPosts.length > 0 ? (
              featuredPosts.map((post) => (
                <PostCard key={post.id} post={post} variant="compact" />
              ))
            ) : (
              <p className="border-y border-border/70 py-8 text-muted-foreground">
                No featured posts yet.
              </p>
            )}
          </div>
        </section>

        <section
          id="about"
          aria-labelledby="about-heading"
          className="grid gap-10 border-y border-border/70 py-16 md:grid-cols-[minmax(0,240px)_minmax(0,1fr)] md:gap-16 md:py-24"
        >
          <header className="space-y-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              03 / About
            </p>
            <h2 id="about-heading" className="text-3xl font-black tracking-[-0.045em] md:text-4xl">
              A little more
            </h2>
          </header>

          <div className="max-w-3xl space-y-7">
            <p className="text-pretty text-xl leading-9 text-foreground md:text-2xl md:leading-10">
              I&apos;m an SDE II from Kerala, India. Right now, I&apos;m working on
              bringing AI into developer workflows and the platform around them.
            </p>
            <p className="max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              I tend to follow problems across boundaries instead of staying
              inside one label. The longer version includes rate limiters,
              warehouses, billing ledgers, a gaming network, and a few unexpected
              detours.
            </p>
            <SectionLink href="/info">The longer version</SectionLink>
          </div>
        </section>
      </div>
    </div>
  );
}
