import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/feedback/Badge";
import { RepositoryCorner } from "@/components/common/RepositoryCorner";
import { SiteFooter } from "@/components/ui/layout/SiteFooter";

import { CategoryCard } from "@/components/common/CategoryCard";
import { toolsByCategory } from "@/config/tools";

const inDevelopmentSlugs = new Set([
  "video-converter",
  "frames-extractor",
  "image-cropper",
]);

export default function Home() {
  return (
    <div className="page-shell">
      <div className="page-grid-overlay" />

      <RepositoryCorner className="fixed right-0 top-0 z-20 p-2 sm:p-3" />

      <main className="page-main flex gap-10 flex-col items-center">
        <section className="flex flex-col items-center overflow-hidden rounded-2xl p-8 shadow-xl shadow-black/10 sm:p-10">
          <Badge
            variant="outline"
            className="flex mb-3 rounded-full gap-2 items-center badge-emerald px-4 py-2"
          >
            <Sparkles className="size-3.5" />
            Open-source browser utilities
          </Badge>

          <div className="flex flex-col gap-5 items-center">
            <h1 className="text-4xl font-semibold text-neutral-100 tracking-tight sm:text-8xl">
              Open Tools
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
              A growing collection of focused, local-first utilities for image,
              text, and design workflows. Each tool lives on its own route.
            </p>
          </div>
        </section>

        <section>
          <div className="columns-1 gap-5 md:columns-2 2xl:columns-3">
            {toolsByCategory.map((category) => (
              <CategoryCard
                key={category.name}
                category={category}
                tools={category.tools}
                inDevelopmentSlugs={inDevelopmentSlugs}
              />
            ))}
          </div>
        </section>

        <SiteFooter className="mt-12 border-t border-white/5 pt-8" />
      </main>
    </div>
  );
}
