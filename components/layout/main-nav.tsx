"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/posts/blog", label: "Blog" },
  { href: "/info", label: "About" },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList className="gap-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink
                asChild
                className={cn(
                  navigationMenuTriggerStyle(),
                  "h-9 rounded-full px-4 font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground transition-colors",
                  "hover:bg-muted/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
                  isActive && "bg-muted/70 text-foreground"
                )}
              >
                <Link href={item.href}>{item.label}</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
