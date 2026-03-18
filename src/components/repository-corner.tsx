import { Github } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";

interface RepositoryCornerProps {
  className?: string;
}

export function RepositoryCorner({ className }: RepositoryCornerProps) {
  return (
    <div className={cn("z-20", className)}>
      <Button
        asChild
        variant="outline"
        size="icon"
        className="size-11 rounded-full bg-card/85 shadow-sm backdrop-blur-sm transition-transform hover:scale-110 active:scale-95 sm:size-12"
      >
        <a href={siteConfig.repositoryUrl} target="_blank" rel="noreferrer">
          <Github className="size-5" />
        </a>
      </Button>
    </div>
  );
}
