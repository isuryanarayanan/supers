import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Text Content */}
          <div className="space-y-8 order-2 lg:order-1">
            <section>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
                About
              </h1>

              <div className="space-y-8">
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <p className="text-lg font-light leading-relaxed text-foreground">
                    arun nura is a kerala-based multidisciplinary art
                    practitioner specialising in visual practices, experimental
                    films and theatre performances. he graduated as a mechanical
                    engineer, and his areas of interest widened into
                    anthropological studies, films, performance arts and ai-code
                    art.{" "}
                    <Link
                      href="https://www.instagram.com/arun.nura/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      @moodupani
                    </Link>
                    .
                  </p>

                  <h6 className="text-base font-bold mt-8 mb-4 tracking-wide uppercase text-muted-foreground">
                    Key Concepts - Sporadic Cinema, Pseudo-futurism, Process-ing
                  </h6>
                </div>

                <div className="grid gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-4 tracking-tight">
                        Download
                      </h3>
                      <Button asChild className="font-medium w-full sm:w-auto">
                        <Link
                          href="https://drive.google.com/file/d/15wvnriDqfn0tJTHynQ5Hs7UaNQc0eu3Z/view?usp=drive_link"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          CV and Resume
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-4 tracking-tight">
                        Contact
                      </h3>
                      <div className="space-y-3">
                        <p className="text-muted-foreground">
                          Feel free to reach out for collaborations or
                          inquiries:
                        </p>
                        <div className="flex flex-col gap-3">
                          <Button
                            variant="link"
                            className="p-0 h-auto justify-start font-medium"
                            asChild
                          >
                            <a href="mailto:arunr6600@yahoo.com">
                              Email: arunr6600@yahoo.com
                            </a>
                          </Button>
                          <Button
                            variant="link"
                            className="p-0 h-auto justify-start font-medium"
                            asChild
                          >
                            <Link href="/blog">Blog</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>
          </div>

          {/* Right Side - Interactive Images */}
          <div className="relative h-[500px] md:h-[600px] lg:h-[700px] order-1 lg:order-2">
            <div className="relative w-full h-full group">
              {/* Default Image (monKEY) */}
              <div className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-0">
                <Image
                  src="https://arunrajan6600.github.io/arunnura/images/monKEY.png"
                  alt="Wireframe Design"
                  fill
                  className="object-cover rounded-lg shadow-xl"
                  unoptimized
                  priority
                />
              </div>
              {/* Hover Image (manKEY) - revealed on hover */}
              <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <Image
                  src="https://arunrajan6600.github.io/arunnura/images/manKEY.png"
                  alt="Modern Workspace"
                  fill
                  className="object-cover rounded-lg shadow-xl"
                  unoptimized
                />
              </div>
              {/* Subtle overlay for better contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent rounded-lg pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
