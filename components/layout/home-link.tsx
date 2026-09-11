import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function HomeLink() {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
      Back home
    </Link>
  );
}
