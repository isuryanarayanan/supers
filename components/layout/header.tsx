import Link from "next/link";
import { MainNav } from "@/components/layout/main-nav";
import { MobileNav } from "@/components/layout/mobile-nav";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 md:px-6 w-full">
        {/* Logo on the left */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
              നു
            </span>
          </Link>
        </div>

        {/* <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center space-x-3">
          <Link
            href="/"
            aria-label="Home"
            className="flex items-center space-x-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 441.37 188.16"
              className="h-5 w-auto md:h-7"
              role="img"
              aria-label="Site Logo"
            >
              <g id="Layer_1-2" data-name="Layer 1">
                <g>
                  <polygon
                    points="194.59 188.16 175.59 188.16 175.59 23.01 29.65 168.95 116.8 168.95 116.8 187.95 6.72 187.95 0 171.74 171.74 0 194.59 .08 194.59 188.16"
                    fill="white"
                  />
                  <polygon
                    points="308.38 188.09 294.94 174.66 411.72 57.88 205.33 57.88 286.9 139.46 273.47 152.9 175.67 55.1 175.59 38.88 441.37 38.88 441.37 55.1 308.38 188.09"
                    fill="white"
                  />
                </g>
              </g>
            </svg>
          </Link>
        </div> */}

        {/* Navigation on the right */}
        <div className="flex items-center">
          <MainNav />
        </div>

        {/* Mobile nav button on the right (mobile only) */}
        <div className="md:hidden">
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
