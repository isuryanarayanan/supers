"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[320px] sm:w-[380px] p-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="flex flex-col h-full">
          {/* Header with logo */}
          <div className="flex items-center justify-center py-8 px-6 border-b bg-muted/20">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-3xl font-black text-foreground tracking-tight">
                supers
              </span>
            </Link>
          </div>

          {/* Navigation section */}
          <div className="flex-1 py-6">
            <nav className="flex flex-col space-y-1 px-6">
              <Link
                href="/"
                onClick={handleLinkClick}
                className="flex items-center rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-muted hover:text-foreground text-muted-foreground"
              >
                Home
              </Link>
              <Separator className="my-2" />
              <Link
                href="/projects"
                onClick={handleLinkClick}
                className="flex items-center rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-muted hover:text-foreground text-muted-foreground"
              >
                Projects
              </Link>
              <Separator className="my-2" />
              <Link
                href="/posts/blog"
                onClick={handleLinkClick}
                className="flex items-center rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-muted hover:text-foreground text-muted-foreground"
              >
                Blog
              </Link>
              <Separator className="my-2" />
              <Link
                href="/info"
                onClick={handleLinkClick}
                className="flex items-center rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-muted hover:text-foreground text-muted-foreground"
              >
                About
              </Link>
            </nav>
          </div>

          {/* Footer section (optional) */}
          <div className="border-t bg-muted/10 p-6">
            <p className="text-xs text-muted-foreground text-center font-medium">
              © {new Date().getFullYear()} supers
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
