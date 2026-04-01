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
      <main className="page-main flex gap-10 flex-col items-center">
        <section className="relative flex flex-col items-center overflow-visible rounded-2xl p-8 sm:p-10">
          <Badge
            variant="outline"
            className="flex mb-3 rounded-full gap-2 items-center badge-emerald px-4 py-2"
          >
            <Sparkles className="size-3.5" />
            Open-source browser utilities
          </Badge>

          <div className="relative flex flex-col gap-5 items-center">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-[44%] h-28 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/15 blur-[100px] sm:h-40 sm:w-[26rem]"
            />
            <h1
              className="relative z-10 text-4xl font-semibold tracking-tight text-neutral-100 sm:text-8xl"
              style={{
                textShadow:
                  "0 0 22px rgba(255,255,255,0.2), 0 0 56px rgba(255,255,255,0.12)",
              }}
            >
              Open Tools
            </h1>
            <p className="relative z-10 mt-4 max-w-2xl text-center text-base leading-7 text-muted-foreground sm:text-lg">
              A growing collection of focused, local-first utilities for image,
              text, and design workflows. Each tool lives on its own route.
            </p>
          </div>
        </section>

        <section className="w-full">
          <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
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
