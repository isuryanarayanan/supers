import type { Metadata } from "next";
import { Lato, Roboto_Mono } from "next/font/google";
import "./globals.css";
import "./code-styles.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "sonner";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "supers — Surya Narayanan",
  description:
    "The personal site of Surya Narayanan, a software engineer working on backend systems, developer tools, infrastructure, and AI applications.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${lato.variable} ${robotoMono.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <div className="relative z-10 flex min-h-screen flex-col">
              <main className="relative z-10 w-full flex-1">
                <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 md:py-10 lg:px-8">
                  {children}
                </div>
              </main>
              <Footer />
            </div>
            <Toaster richColors closeButton position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
