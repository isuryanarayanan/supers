"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Github, Instagram, Mail } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return <footer></footer>;
  return (
    <footer className="relative z-10 mt-auto">
      <div className="relative container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Social Media Section */}
          <div className="space-y-2">
            <h3 className="font-bold text-xl tracking-tight">Connect</h3>
            <div className="flex flex-wrap gap-4 justify-center">
              {/* <Button variant="outline" size="icon" asChild>
                <Link
                  href="https://twitter.com/username"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="h-4 w-4" />
                  <span className="sr-only">Twitter</span>
                </Link>
              </Button> */}
              <Button variant="outline" size="icon" asChild>
                <Link
                  href="https://github.com/isuryanarayanan"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4" />
                  <span className="sr-only">GitHub</span>
                </Link>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <Link
                  href="https://instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="h-4 w-4" />
                  <span className="sr-only">Instagram</span>
                </Link>
              </Button>
              {/* <Button variant="outline" size="icon" asChild>
                <Link
                  href="https://linkedin.com/in/username"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="h-4 w-4" />
                  <span className="sr-only">LinkedIn</span>
                </Link>
              </Button> */}
              <Button variant="outline" size="icon" asChild>
                <Link href="mailto:isurya.dev@gmail.com">
                  <Mail className="h-4 w-4" />
                  <span className="sr-only">Email</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="text-center text-sm text-muted-foreground font-medium">
          © {new Date().getFullYear()} Surya Narayanan · supers
        </div>
      </div>
    </footer>
  );
}
