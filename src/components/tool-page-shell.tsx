import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RepositoryCorner } from "@/components/repository-corner";
import { SiteFooter } from "@/components/site-footer";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface ToolPageShellProps {
  title: string;
  description: string;
  children: ReactNode;
  fullWidth?: boolean;
}

export function ToolPageShell({
  title,
  description,
  children,
  fullWidth = false,
}: ToolPageShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,.08),transparent_40%),linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:auto,64px_64px,64px_64px] pointer-events-none" />

      <RepositoryCorner className="fixed right-0 top-0 z-20 p-2 sm:p-3" />

      <main className="relative z-10 w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className={cn("mx-auto", fullWidth ? "w-full lg:px-4 xl:px-8" : "max-w-5xl")}>
          <div className="mb-4 flex justify-start">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="bg-card/70 backdrop-blur-sm"
            >
              <Link href="/">
                <ArrowLeft className="size-4" />
                All tools
              </Link>
            </Button>
          </div>

          <header className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card/80 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
              <Sparkles className="size-3.5 text-amber-500" />
              {siteConfig.name} - 100% client-side
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              <span className="bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
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

          <SiteFooter className="mt-10 border-t pt-6" />
        </div>
      </main>
    </div>
  );
}
