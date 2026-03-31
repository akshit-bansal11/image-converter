import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/interaction/Button";
import { RepositoryCorner } from "@/components/common/RepositoryCorner";
import { SiteFooter } from "@/components/ui/layout/SiteFooter";
import { siteConfig } from "@/config/site";

interface ToolPageShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function ToolPageShell({
  title,
  description,
  children,
}: ToolPageShellProps) {
  return (
    <div className="page-shell">
      <div className="page-grid-overlay" />

      <RepositoryCorner className="fixed right-0 top-0 z-20 p-2 sm:p-3" />

      <main className="page-main">
        <div className="mb-4 flex justify-start">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="glass-button"
          >
            <Link href="/">
              <ArrowLeft className="size-4" />
              All tools
            </Link>
          </Button>
        </div>

        <header className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm text-white/75 backdrop-blur-sm">
            <Sparkles className="size-3.5 text-white/70" />
            {siteConfig.name} - 100% client-side
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>
          {description && (
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              {description}
            </p>
          )}
        </header>

        {children}

        <SiteFooter className="mt-12 border-t border-white/5 pt-8" />
      </main>
    </div>
  );
}
