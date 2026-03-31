import { ToolPill } from "@/components/common/ToolPill";
import type { ToolCategoryDefinition, ToolDefinition } from "@/types/tool";

interface CategoryCardProps {
  category: ToolCategoryDefinition;
  tools: ToolDefinition[];
  inDevelopmentSlugs?: Set<string>;
}

export function CategoryCard({
  category,
  tools,
  inDevelopmentSlugs,
}: CategoryCardProps) {
  const CategoryIcon = category.icon;
  const availableCount = tools.filter(
    (tool) => !inDevelopmentSlugs?.has(tool.slug),
  ).length;

  return (
    <section className="h-full">
      <div className="group h-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f0f0f]/72 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-xl transition-colors duration-300 hover:border-white/15">
        <div className="border-b border-white/8 bg-[linear-gradient(180deg,rgba(44,44,44,0.52)_0%,rgba(31,31,31,0.38)_100%)] p-2">
          <div className="relative rounded-[1.4rem] border border-white/8 bg-white/[0.015] px-6 py-6 sm:px-7 sm:py-7">
            <div className="absolute right-5 top-5 rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-white/60 shadow-[0_0_0_rgba(255,255,255,0)] transition-all duration-300 group-hover:border-white/15 group-hover:bg-white/[0.06] group-hover:text-white group-hover:shadow-[0_0_24px_rgba(255,255,255,0.16)]">
              <CategoryIcon className="size-8 sm:size-9" strokeWidth={1.75} />
            </div>

            <div className="relative z-10 max-w-[78%] space-y-3">
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">
                {availableCount}/{tools.length} live tools
              </div>

              <h2 className="text-2xl font-medium tracking-[-0.04em] text-foreground sm:text-3xl">
                {category.name}
              </h2>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-md px-6 py-6 sm:px-7 sm:py-7">
          <div className="mb-4 flex items-center justify-between border-b border-white/8 pb-3 text-xs uppercase tracking-[0.16em] text-white/40">
            <span>Tools</span>
            <span>{tools.length} total</span>
          </div>

          <div className="grid grid-cols-1 content-start items-start gap-3 sm:grid-cols-2">
            {tools.map((tool) => (
              <ToolPill
                key={tool.slug}
                tool={tool}
                isInDevelopment={inDevelopmentSlugs?.has(tool.slug)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
