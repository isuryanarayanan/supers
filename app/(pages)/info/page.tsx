import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";

const experience = [
  {
    period: "2026 — now",
    role: "Software Engineer II",
    company: "Unifize",
    description:
      "I build AI-assisted developer tools and work on the next version of the Unifize platform. This includes a Go service that turns business requirements into executable automations, AI-assisted pull-request reviews, work in the existing Clojure codebase, and the platform rewrite in Go.",
  },
  {
    period: "2023 — 2026",
    role: "Senior Software Engineer",
    company: "WareIQ",
    description:
      "I worked across logistics infrastructure and customer-facing products. I built Perimeter, an egress rate limiter processing more than two million requests a day; designed billing systems handling millions of ledger entries; and shipped warehouse, forecasting, integration, and internal tooling used in daily operations.",
  },
  {
    period: "2022 — 2023",
    role: "Founding Engineer",
    company: "Glitchh",
    description:
      "I built and scaled the backend for a social platform for gamers. The work covered Python and Go services, GraphQL, PostgreSQL, Kubernetes, CI/CD, observability, notifications, and coordination with the frontend and mobile teams.",
  },
  {
    period: "2020 — 2022",
    role: "Full-stack developer",
    company: "Freelance",
    description:
      "I delivered web and mobile projects for startups and educational institutions, including blockchain tooling, event systems, remote-learning software, community applications, and institutional data tools.",
  },
];

const skillGroups = [
  {
    label: "Languages",
    value: "Go, Python, TypeScript, JavaScript, Bash, and SQL",
  },
  {
    label: "Backend and data",
    value: "Django, FastAPI, GraphQL, PostgreSQL, Redis, RabbitMQ, Celery, and ChromaDB",
  },
  {
    label: "Infrastructure",
    value: "AWS, Docker, Kubernetes, Helm, Nginx, Envoy, Istio, and GitHub Actions",
  },
  {
    label: "Observability",
    value: "OpenTelemetry, Grafana, Prometheus, Loki, Tempo, Fluent Bit, OpenSearch, and SigNoz",
  },
  {
    label: "AI systems",
    value: "LLM applications, RAG, LangGraph agents, MCP tools, and vector search",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-5xl py-12 md:py-20">
      <header className="max-w-4xl pb-16 md:pb-24">
        <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          About
        </p>
        <h1 className="text-balance text-5xl font-black leading-[0.95] tracking-[-0.06em] md:text-7xl">
          I build backend systems and the tools around them.
        </h1>
        <p className="mt-8 max-w-3xl text-pretty text-lg leading-8 text-muted-foreground md:text-xl md:leading-9">
          I&apos;m Surya Narayanan, a software engineer from Kerala, India. My work
          spans distributed systems, infrastructure, developer tooling, and
          product engineering. I enjoy learning what a problem requires and
          carrying the solution from its first sketch into production.
        </p>
      </header>

      <section
        aria-labelledby="work-heading"
        className="grid gap-10 border-t border-border/70 py-14 md:grid-cols-[180px_1fr] md:gap-16 md:py-20"
      >
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            01 / Work
          </p>
          <h2 id="work-heading" className="mt-3 text-2xl font-black tracking-[-0.04em]">
            Experience
          </h2>
        </div>

        <div>
          {experience.map((item) => (
            <article
              key={`${item.company}-${item.period}`}
              className="grid gap-3 border-t border-border/70 py-7 first:border-t-0 first:pt-0 md:grid-cols-[130px_1fr] md:gap-8"
            >
              <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
                {item.period}
              </p>
              <div>
                <h3 className="text-xl font-bold tracking-[-0.025em]">
                  {item.role}
                </h3>
                <p className="mt-1 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {item.company}
                </p>
                <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="tools-heading"
        className="grid gap-10 border-t border-border/70 py-14 md:grid-cols-[180px_1fr] md:gap-16 md:py-20"
      >
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            02 / Tools
          </p>
          <h2 id="tools-heading" className="mt-3 text-2xl font-black tracking-[-0.04em]">
            What I use
          </h2>
        </div>

        <dl className="divide-y divide-border/70 border-y border-border/70">
          {skillGroups.map((group) => (
            <div key={group.label} className="grid gap-2 py-5 sm:grid-cols-[150px_1fr] sm:gap-8">
              <dt className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
                {group.label}
              </dt>
              <dd className="leading-7 text-foreground/90">{group.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        aria-labelledby="contact-heading"
        className="grid gap-10 border-y border-border/70 py-14 md:grid-cols-[180px_1fr] md:gap-16 md:py-20"
      >
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            03 / Contact
          </p>
          <h2 id="contact-heading" className="mt-3 text-2xl font-black tracking-[-0.04em]">
            Get in touch
          </h2>
        </div>

        <div className="max-w-2xl">
          <p className="text-lg leading-8 text-muted-foreground">
            If you want to discuss a project, a technical problem, or just say
            hello, email is the best way to reach me.
          </p>
          <Button asChild className="mt-5">
            <Link href="mailto:supersuryan69@gmail.com">
              <Mail className="h-4 w-4" />
              supersuryan69@gmail.com
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
