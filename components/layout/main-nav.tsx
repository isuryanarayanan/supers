"use client";

import * as React from "react";
import Link from "next/link";
import { useState, useCallback, useRef } from "react";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export function MainNav() {
  const [isPostsOpen, setIsPostsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsPostsOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsPostsOpen(false);
    }, 200);
  }, []);

  const handleLinkClick = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsPostsOpen(false);
  }, []);

  return (
    <>
      {/* Main Navigation */}
      <NavigationMenu className="hidden md:flex">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className={`${navigationMenuTriggerStyle()} font-medium`}
            >
              <Link href="/">Home</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className={`${navigationMenuTriggerStyle()} font-medium`}
            >
              <Link href="/projects">Projects</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <NavigationMenuLink
              className={`${navigationMenuTriggerStyle()} font-medium cursor-pointer`}
            >
              Posts
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className={`${navigationMenuTriggerStyle()} font-medium`}
            >
              <Link href="/info">About</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* Full-width dropdown positioned as extension of navbar */}
      {isPostsOpen && (
        <div
          className="fixed left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border shadow-xl z-50"
          style={{
            top: "var(--navbar-height, 64px)",
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Invisible bridge to prevent gaps */}
          <div className="absolute -top-2 left-0 right-0 h-2 bg-transparent" />

          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Browse Posts
              </h3>
              <p className="text-sm text-muted-foreground">
                Explore different categories of content
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Link
                href="/posts/blog"
                className="group block select-none rounded-xl p-6 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent/50 hover:shadow-md focus:bg-accent focus:text-accent-foreground border border-transparent hover:border-border/50"
                onClick={handleLinkClick}
              >
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="text-base font-medium leading-none group-hover:text-accent-foreground">
                    Blog
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground group-hover:text-muted-foreground/80">
                  Personal thoughts, tutorials, and technical insights for
                  developers and tech enthusiasts.
                </p>
              </Link>

              <Link
                href="/posts/papers"
                className="group block select-none rounded-xl p-6 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent/50 hover:shadow-md focus:bg-accent focus:text-accent-foreground border border-transparent hover:border-border/50"
                onClick={handleLinkClick}
              >
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <div className="text-base font-medium leading-none group-hover:text-accent-foreground">
                    Articles & Papers
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground group-hover:text-muted-foreground/80">
                  In-depth technical articles, research papers, and
                  comprehensive professional documentation.
                </p>
              </Link>

              <Link
                href="/posts/stories"
                className="group block select-none rounded-xl p-6 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent/50 hover:shadow-md focus:bg-accent focus:text-accent-foreground border border-transparent hover:border-border/50"
                onClick={handleLinkClick}
              >
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-purple-600 dark:text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                      />
                    </svg>
                  </div>
                  <div className="text-base font-medium leading-none group-hover:text-accent-foreground">
                    Stories & Literary
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground group-hover:text-muted-foreground/80">
                  Creative fiction, poetry, short stories, narratives, and
                  various literary explorations.
                </p>
              </Link>

              <Link
                href="/posts/general"
                className="group block select-none rounded-xl p-6 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent/50 hover:shadow-md focus:bg-accent focus:text-accent-foreground border border-transparent hover:border-border/50"
                onClick={handleLinkClick}
              >
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-orange-600 dark:text-orange-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                  <div className="text-base font-medium leading-none group-hover:text-accent-foreground">
                    Other Writings
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground group-hover:text-muted-foreground/80">
                  Miscellaneous thoughts, personal reflections, creative
                  expressions, and diverse content.
                </p>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
