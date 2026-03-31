import { Github, Linkedin, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/interaction/Button";

interface SiteFooterProps {
  className?: string;
}

export function SiteFooter({ className }: SiteFooterProps) {
  return (
    <footer className={cn("flex flex-col items-center gap-6", className)}>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Made by: {siteConfig.author.name} ({siteConfig.author.role})
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15"
        >
          <a href={siteConfig.social.github} target="_blank" rel="noreferrer">
            <Github className="size-4" />
            GitHub
          </a>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15"
        >
          <a href={siteConfig.social.linkedin} target="_blank" rel="noreferrer">
            <Linkedin className="size-4" />
            LinkedIn
          </a>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15"
        >
          <a href={`mailto:${siteConfig.social.email}`}>
            <Mail className="size-4" />
            Mail
          </a>
        </Button>
      </div>
    </footer>
  );
}
