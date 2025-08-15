import { Button } from "@/components/ui/button";
import Link from "next/link";
import { posts } from "@/data/posts";
import { PostCard } from "@/components/post/post-card";
import MatrixGridBackground from "@/components/ui/matrix-grid-background";

export default function Home() {
  const featuredProjects = posts.filter(
    (post) =>
      post.status === "published" && post.featured && post.type === "project"
  );

  const featuredBlogPosts = posts.filter(
    (post) =>
      post.status === "published" && post.featured && post.type === "blog"
  );

  return (
    <>
      {/* Full-screen Matrix Grid Background - only visible in dark mode */}
      <MatrixGridBackground
        className="dark:block hidden"
        enableWaveAnimation={false}
        enableMouseHoverAnimation={true}
        enableCardBorderAnimation={false}
      />

      {/* Content */}
      <div className="flex flex-col gap-20 md:gap-28 lg:gap-32">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center gap-8 py-16 md:py-20 lg:py-24 text-center">
          <div className="flex items-center">
            <Link
              href="/"
              aria-label="Home"
              className="flex items-center space-x-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 441.37 188.16"
                className="h-5 w-auto md:h-7"
                role="img"
                aria-label="Site Logo"
              >
                <g id="Layer_1-2" data-name="Layer 1">
                  <g>
                    <polygon
                      points="194.59 188.16 175.59 188.16 175.59 23.01 29.65 168.95 116.8 168.95 116.8 187.95 6.72 187.95 0 171.74 171.74 0 194.59 .08 194.59 188.16"
                      fill="white"
                    />
                    <polygon
                      points="308.38 188.09 294.94 174.66 411.72 57.88 205.33 57.88 286.9 139.46 273.47 152.9 175.67 55.1 175.59 38.88 441.37 38.88 441.37 55.1 308.38 188.09"
                      fill="white"
                    />
                  </g>
                </g>
              </svg>
            </Link>
          </div>
          <h1 className="text-4xl font-black tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl leading-none">
            <span className="text-primary">
              {"<"}arun nura{">"}
            </span>
          </h1>
          <p className="text-xl text-muted-foreground md:text-2xl font-light tracking-wide">
            multi-disciplinary art practitioner
          </p>
        </section>

        {/* Featured Projects */}
        <section className="w-full">
          <div className="flex items-center justify-between mb-12 md:mb-16">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Featured Projects
            </h2>
            <Button variant="ghost" asChild>
              <Link
                href="/projects"
                className="text-muted-foreground hover:text-primary font-medium"
              >
                View all projects →
              </Link>
            </Button>
          </div>
          <div className="grid gap-8 md:gap-10">
            {featuredProjects.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>

        {/* Featured Blog Posts */}
        <section className="w-full">
          <div className="flex items-center justify-between mb-12 md:mb-16">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Featured Posts
            </h2>
            <Button variant="ghost" asChild>
              <Link
                href="/blog"
                className="text-muted-foreground hover:text-primary font-medium"
              >
                View all posts →
              </Link>
            </Button>
          </div>
          <div className="grid gap-8 md:gap-10">
            {featuredBlogPosts.map((post) => (
              <PostCard key={post.id} post={post} variant="compact" />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
