import Link from "next/link";

const links = [
  { href: "/posts/blog", label: "Blog" },
  { href: "/projects", label: "Projects" },
  { href: "/info", label: "About" },
  { href: "https://github.com/isuryanarayanan", label: "GitHub" },
  { href: "https://www.linkedin.com/in/surya-narayanan-25bbb8168/", label: "LinkedIn" },
];

export function Footer() {
  return (
    <footer className="relative z-10 mt-auto border-t border-border/60">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.16em]">
          © {new Date().getFullYear()} Supers
        </p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
