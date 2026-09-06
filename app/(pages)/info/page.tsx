import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl py-10 md:py-16">
      <section className="space-y-10">
        <header className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">About</h1>
          <p className="text-lg leading-8 text-muted-foreground">
            I&apos;m Surya Narayanan, a software engineer from Kerala, India.
            I work on backend systems, infrastructure, developer tools, and web apps.
          </p>
        </header>

        <div className="space-y-8 text-base leading-7 text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Work</h2>
            <p>
              I&apos;m currently a Senior Software Engineer at WareIQ, working on logistics,
              traffic management, integrations, and forecasting systems.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Previously</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>Glitchh — backend services, infrastructure, and team lead work.</li>
              <li>Edith Industries — full-stack apps and ML experiments.</li>
              <li>Atlaria — website and tooling for a Solana NFT collection.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Tools</h2>
            <p>
              Go, Python, TypeScript, React, Next.js, AWS, Docker, Kubernetes,
              PostgreSQL, MySQL, MongoDB, DynamoDB, Bash, and Lua.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Education</h2>
            <p>
              B.Tech in Computer Science from Adi Shankara Institute of Engineering
              and Technology.
            </p>
          </section>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-border/70 pt-8">
          <Button variant="outline" asChild>
            <Link href="https://github.com/isuryanarayanan" target="_blank" rel="noopener noreferrer">
              GitHub
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link
              href="https://www.linkedin.com/in/surya-narayanan-25bbb8168/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="https://twitter.com/supersuryan" target="_blank" rel="noopener noreferrer">
              Twitter
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
