import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12 md:py-16">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="grid gap-12">
          <div className="space-y-8">
            <section>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">
                About
              </h1>

              <div className="space-y-8">
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <p className="text-lg leading-relaxed text-foreground">
                    I&apos;m <strong>Surya Narayanan</strong>, a Software
                    Engineer based in Kerala, India. I build distributed
                    systems, developer tooling, and front-end experiences.
                    Currently building supply-chain and logistics systems at{" "}
                    <strong>WareIQ</strong>.
                  </p>

                  <h3 className="text-xl font-semibold mt-8 mb-3 tracking-tight">
                    Experience highlights
                  </h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>WareIQ / Inventorylogiq (2023—Present)</strong> —
                      Built <em>Perimeter</em>, an egress traffic controller in
                      Go (1.1M+ req/day). Developed a time-series forecasting
                      service for inventory demand and optimal routing. Scaled a
                      B2B logistics middleware platform in collaboration with
                      global partners.
                    </li>
                    <li>
                      <strong>Glitchh (2022—2023)</strong> — Led a small team
                      and multiple backend services for a gaming social
                      platform. Built scalable Python services on AWS with
                      Kubernetes, automated release workflows, created{" "}
                      <em>Genie</em> (env orchestrator), and transitioned REST
                      services to GraphQL with frontend helpers.
                    </li>
                    <li>
                      <strong>Edith Industries (2019—2020)</strong> — Full‑stack
                      apps from scratch; DB design across
                      PostgreSQL/MySQL/MongoDB; deep-learning image classifiers
                      for satellite spectral data (Reboot Kerala Hackathon).
                    </li>
                    <li>
                      <strong>Atlaria (2021—2022)</strong> — Website and tools
                      for a Solana NFT collection.
                    </li>
                  </ul>

                  <h3 className="text-xl font-semibold mt-8 mb-3 tracking-tight">
                    Recent work
                  </h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>CardanoWarriors.io</strong> — Floor bot scanning
                      Cardano NFT markets in real-time; moderation bot for
                      community ops.
                    </li>
                    <li>
                      <strong>@BrownNFT</strong> — Auction system for artwork in
                      Discord.
                    </li>
                    <li>
                      <strong>ASIET</strong> — Websites for college events and
                      student-led projects.
                    </li>
                  </ul>

                  <h3 className="text-xl font-semibold mt-8 mb-3 tracking-tight">
                    Skills
                  </h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Languages</strong>: Go, Python,
                      JavaScript/TypeScript, Bash, Lua, C++
                    </li>
                    <li>
                      <strong>Backend</strong>: Django, Flask, Node.js;
                      REST/GraphQL; Kubernetes (k3s/k3d), Helm; NGINX, Envoy
                    </li>
                    <li>
                      <strong>Frontend</strong>: React, Next.js, Vue, React
                      Native/Expo, Flutter
                    </li>
                    <li>
                      <strong>Cloud/Infra</strong>: AWS, Docker, Serverless,
                      Firebase, SQL/NoSQL
                    </li>
                    <li>
                      <strong>Other</strong>: System design, UI/UX,
                      diffusion/transformer model fine‑tuning
                    </li>
                  </ul>

                  <h3 className="text-xl font-semibold mt-8 mb-3 tracking-tight">
                    Education
                  </h3>
                  <p>
                    B.Tech in Computer Science — Adi Shankara Institute of
                    Engineering and Technology (2018–2022)
                  </p>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-semibold tracking-tight">
                    Connect
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-3 flex-wrap">
                      <Button asChild className="font-medium">
                        <Link href="mailto:supersuryan69@gmail.com">Email</Link>
                      </Button>
                      <Button variant="outline" asChild className="font-medium">
                        <Link
                          href="https://github.com/isuryanarayanan"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          GitHub
                        </Link>
                      </Button>
                      <Button variant="outline" asChild className="font-medium">
                        <Link
                          href="https://twitter.com/supersuryan"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Twitter
                        </Link>
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      📍 Kerala, India
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
