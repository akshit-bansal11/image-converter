import type { ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RepositoryCorner } from "@/components/repository-corner";
import { SiteFooter } from "@/components/site-footer";
import { siteConfig } from "@/config/site";

interface ToolPageShellProps {
  title: string;
  description: string;
  icon: LucideIcon;
  children: ReactNode;
}

export function ToolPageShell({
  title,
  description,
  icon: Icon,
  children,
}: ToolPageShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,.08),transparent_40%),linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:auto,64px_64px,64px_64px] pointer-events-none" />

      <RepositoryCorner className="fixed right-0 top-0 p-2 sm:p-3" />

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-3">
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

          <p className="text-sm text-muted-foreground">{siteConfig.name}</p>
        </div>

        <section className="mb-8 rounded-[2rem] border bg-card/70 p-8 shadow-xl shadow-black/5 backdrop-blur-sm sm:p-10">
          <div className="inline-flex rounded-2xl border bg-background/70 p-3">
            <Icon className="size-6" />
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
            {description}
          </p>
        </section>

        {children}

        <SiteFooter className="mt-10 border-t pt-6" />
      </main>
    </div>
  );
}
