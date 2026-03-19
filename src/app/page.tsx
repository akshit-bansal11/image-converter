import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RepositoryCorner } from "@/components/repository-corner";
import { SiteFooter } from "@/components/site-footer";

import { tools } from "@/config/tools";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,.08),transparent_40%),linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:auto,64px_64px,64px_64px] pointer-events-none" />

      <RepositoryCorner className="fixed right-0 top-0 z-20 p-2 sm:p-3" />

      <main className="relative z-10 w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] border bg-card/70 p-8 shadow-xl shadow-black/5 backdrop-blur-sm sm:p-10">
          <Badge
            variant="outline"
            className="mb-5 gap-2 border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-300"
          >
            <Sparkles className="size-3.5" />
            Open-source browser utilities
          </Badge>

          <div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
              open-tools
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
              A growing collection of focused, local-first utilities for image,
              text, and design workflows. Each tool lives on its own route.
            </p>
          </div>
        </section>

        <section className="mt-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {tools.map((tool) => {
              const Icon = tool.icon;

              return (
                <Link key={tool.slug} href={tool.href} className="group">
                  <Card className="h-full border-white/10 bg-card/70 transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10">
                    <CardHeader className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="rounded-2xl border bg-background/70 p-3">
                          <Icon className="size-5" />
                        </div>
                        <Badge variant="outline" className="uppercase">
                          {tool.category}
                        </Badge>
                      </div>
                      <div>
                        <CardTitle className="text-xl">{tool.name}</CardTitle>
                        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                          {tool.description}
                        </p>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        <SiteFooter className="mt-10 border-t pt-6" />
      </main>
    </div>
  );
}
