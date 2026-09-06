import Link from "next/link";
import MatrixShaderBackground from "@/components/ui/matrix-shader-background";

export default function Home() {
  return (
    <>
      <MatrixShaderBackground className="dark:block hidden" />

      <section className="relative z-10 flex min-h-[calc(100vh-12rem)] items-center justify-center py-20 text-center">
        <div className="mx-auto max-w-4xl px-4">
          <p className="animate-fade-in-300 mb-5 font-mono text-[11px] font-medium uppercase tracking-[0.32em] text-zinc-500 md:text-xs">
            supers
          </p>
          <h1 className="animate-fade-in-500 text-balance text-5xl font-black leading-[0.92] tracking-[-0.075em] text-zinc-50 md:text-7xl lg:text-8xl">
            Surya Narayanan
          </h1>
          <div className="mx-auto mt-7 h-px w-24 animate-fade-in-700 bg-gradient-to-r from-transparent via-zinc-500 to-transparent" />
          <p className="animate-fade-in-900 mx-auto mt-7 max-w-2xl text-pretty text-base leading-7 text-zinc-400 md:text-lg md:leading-8">
            Software engineer based in Kerala, India.
          </p>
          <div className="animate-fade-in-1000 mt-9 flex flex-wrap items-center justify-center gap-3 font-mono text-xs uppercase tracking-[0.14em]">
            <Link
              href="/posts/blog"
              className="rounded-full border border-white/15 bg-white/[0.03] px-4 py-2.5 text-zinc-100 transition-colors hover:border-white/30 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              Blog
            </Link>
            <Link
              href="/projects"
              className="rounded-full border border-white/10 px-4 py-2.5 text-zinc-400 transition-colors hover:border-white/25 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              Projects
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
