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
                    I&apos;m <strong>Surya Narayanan</strong>, a Senior Software
                    Engineer based in Kerala, India. I specialize in building
                    distributed systems, developer tooling, and scalable backend
                    architectures. Currently architecting supply-chain and
                    logistics systems at <strong>WareIQ</strong>, where I work
                    on high-throughput traffic management systems and inventory
                    forecasting platforms.
                  </p>

                  <h3 className="text-xl font-semibold mt-8 mb-3 tracking-tight">
                    Experience highlights
                  </h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>WareIQ / Inventorylogiq (2023—Present)</strong> —
                      Senior Software Engineer building high-scale logistics
                      infrastructure. Architected <em>Perimeter</em>, a Go-based
                      egress traffic controller handling 1M+ requests daily with
                      intelligent rate limiting and monitoring. Developed
                      time-series forecasting services for inventory demand
                      prediction and optimal routing algorithms. Led integration
                      projects with global logistics partners and scaling B2B
                      middleware platforms.
                    </li>
                    <li>
                      <strong>Glitchh (2022—2023)</strong> — Technical Lead
                      managing a development team and architecting backend
                      services for a gaming social platform. Built scalable
                      Python microservices on AWS with Kubernetes orchestration,
                      implemented CI/CD pipelines, developed
                      <em>Genie</em> (environment orchestration tool), and
                      migrated REST APIs to GraphQL with custom frontend
                      tooling.
                    </li>
                    <li>
                      <strong>Edith Industries (2019—2020)</strong> — Full‑stack
                      developer creating applications from ground up, designing
                      database architectures across PostgreSQL, MySQL, and
                      MongoDB. Built deep-learning image classification systems
                      for satellite spectral analysis (featured in Reboot Kerala
                      Hackathon).
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
                    Technical Expertise
                  </h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Languages</strong>: Go, Python,
                      JavaScript/TypeScript, Rust, Bash, Lua, C++
                    </li>
                    <li>
                      <strong>Backend & Systems</strong>: Django, Flask,
                      FastAPI, Node.js, microservices architecture, REST/GraphQL
                      APIs, gRPC
                    </li>
                    <li>
                      <strong>Infrastructure</strong>: Kubernetes, Docker, Helm,
                      NGINX, Envoy Proxy, service mesh, distributed systems
                      design
                    </li>
                    <li>
                      <strong>Cloud Platforms</strong>: AWS (Lambda, ECS, RDS,
                      S3, CloudFormation), serverless architectures,
                      infrastructure as code
                    </li>
                    <li>
                      <strong>Frontend</strong>: React, Next.js, Vue, React
                      Native/Expo, Flutter, TypeScript, Tailwind CSS
                    </li>
                    <li>
                      <strong>Data & AI</strong>: PostgreSQL, MySQL, MongoDB,
                      DynamoDB, time-series databases, machine learning model
                      deployment, transformer/diffusion model fine-tuning
                    </li>
                    <li>
                      <strong>DevOps</strong>: CI/CD pipelines, monitoring &
                      alerting, performance optimization, system reliability
                      engineering
                    </li>
                  </ul>

                  <h3 className="text-xl font-semibold mt-8 mb-3 tracking-tight">
                    Education & Background
                  </h3>
                  <div className="space-y-3">
                    <p>
                      <strong>B.Tech in Computer Science</strong>
                      <br />
                      Adi Shankara Institute of Engineering and Technology
                      (2018–2022)
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Specialized in distributed systems, algorithms, and
                      software engineering. Active in hackathons and technical
                      competitions, with a focus on practical applications of
                      machine learning and system design.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-semibold tracking-tight">
                    Connect
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-3 flex-wrap">
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
                          href="https://www.linkedin.com/in/surya-narayanan-25bbb8168/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          LinkedIn
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
