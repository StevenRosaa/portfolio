"use client";

import { X, Minus, ChevronsLeftRight } from "lucide-react"; 
import { useState } from "react";
import { cn } from "@/lib/utils"; 

export function MacHeader() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // UPDATED: Changed hover:scale-110 to hover:scale-125 for a more noticeable "pop" effect
  const dotBaseClass = "w-3 h-3 rounded-full flex items-center justify-center shadow-sm transition-transform duration-200 ease-out hover:scale-150 active:scale-90";

  return (
    <div className="hidden md:flex h-12 shrink-0 items-center border-b border-black/5 px-5 justify-between bg-gradient-to-b from-gray-50 to-[#F2F2F2] rounded-t-2xl select-none">
        
        {/* TRAFFIC LIGHTS GROUP */}
        <div className="flex gap-2 group items-center">
            
            {/* 1. CLOSE (Red) */}
            <div className={cn(dotBaseClass, "bg-[#FF5F57] border border-[#E0443E]")}>
                <X size={8} className="text-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200" strokeWidth={3} />
            </div>

            {/* 2. MINIMIZE (Yellow) */}
            <div className={cn(dotBaseClass, "bg-[#FEBC2E] border border-[#D89E24]")}>
                <Minus size={8} className="text-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200" strokeWidth={3} />
            </div>

            {/* 3. EXPAND (Green) */}
            <button 
                onClick={toggleFullscreen}
                className={cn(dotBaseClass, "bg-[#28C840] border border-[#1AAB29] hover:cursor-pointer")}
            >
                {isFullscreen ? (
                    <ChevronsLeftRight size={6} className="text-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rotate-45" strokeWidth={3} />
                ) : (
                    <ChevronsLeftRight size={6} className="text-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -rotate-45" strokeWidth={3} />
                )}
            </button>
        </div>

        {/* WINDOW TITLE */}
        <div className="text-xs font-bold text-neutral-500/80 flex items-center gap-2 drop-shadow-sm">
            <span className="opacity-50 text-base">📁</span>
            <span className="mt-0.5">giacomo_portfolio — zsh — 80x24</span>
        </div>

        {/* SPACER */}
        <div className="w-14" />
    </div>
  );
}