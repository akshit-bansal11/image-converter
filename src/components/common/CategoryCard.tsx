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

  return (
    <section className="mb-5 break-inside-avoid">
      <div className="flex flex-col overflow-hidden rounded-[2rem] border-[6px] border-[#27272788]">
        <div className="relative bg-[#27272788] px-7 py-8 sm:px-8 sm:py-9">
          <div className="absolute right-6 top-5 text-white/[0.25] sm:right-7 sm:top-6">
            <CategoryIcon className="size-12 sm:size-14" strokeWidth={1.75} />
          </div>

          <h2 className="relative z-10 max-w-[75%] text-2xl font-normal tracking-[-0.04em] text-foreground sm:text-3xl">
            {category.name}
          </h2>
        </div>

        <div className="rounded-b-[2rem] bg-[#27272722] px-8 py-8 sm:px-9 sm:py-9">
          <div className="grid grid-cols-2 content-start items-start gap-3.5">
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
