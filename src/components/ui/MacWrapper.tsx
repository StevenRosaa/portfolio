"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { MacHeader } from "./MacHeader";

export function MacWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex flex-col md:items-center md:justify-center md:p-8 lg:p-12 overflow-hidden bg-transparent">
      
      <div className={cn(
        // Mobile
        "w-full h-full flex flex-col bg-[#F5F5F7]", 

        // Desktop
        "md:bg-white/85 md:backdrop-blur-2xl",
        
        "min-h-screen md:min-h-0", 
        "md:h-[85vh] md:max-w-7xl md:rounded-2xl md:shadow-2xl md:border md:border-white/20"
        )}>
        
        {/* MacOS Style Header */}
        <MacHeader />

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden md:scroll-smooth custom-scrollbar">
            {children}
        </div>

      </div>
    </div>
  );
}