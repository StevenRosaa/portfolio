import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  noPadding?: boolean; // Option to disable padding for full-bleed images
}

export function BentoCard({ children, className, title, noPadding = false }: BentoCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-[32px]",
        
        // Mobile
        "bg-white/95 shadow-sm border border-neutral-200", 

        // Desktop (md):
        "md:bg-white/60 md:backdrop-blur-xl md:border-white/20",
        
        "hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out",
        !noPadding && "p-8",
        className
      )}
    >
      {title && (
        <div className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-400">
          {title}
        </div>
      )}
      
      {children}
    </div>
  );
}