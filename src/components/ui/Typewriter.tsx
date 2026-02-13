"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
}

export function Typewriter({ 
  text, 
  speed = 30, 
  delay = 500,
  className 
}: TypewriterProps) {
  const [displayedIndex, setDisplayedIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [isCursorVisible, setIsCursorVisible] = useState(true);

  // Handle initial start delay
  useEffect(() => {
    const timeout = setTimeout(() => {
      setStarted(true);
    }, delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  // Handle typing effect and cursor lifecycle
  useEffect(() => {
    if (!started) return;

    if (displayedIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else {
      // Hide cursor 1.5s after typing completes
      const cursorTimeout = setTimeout(() => {
        setIsCursorVisible(false);
      }, 1500);
      return () => clearTimeout(cursorTimeout);
    }
  }, [displayedIndex, started, text.length, speed]);

  return (
    <div className={cn("inline-block whitespace-pre-wrap", className)} aria-label={text}>
      
      {/* Visible (Typed) Text */}
      <span className="relative">
        {text.slice(0, displayedIndex)}
        
        {/* Animated Cursor */}
        <span 
          className={cn(
            "ml-[2px] w-[3px] h-[1.1em] bg-[#007AFF] inline-block align-middle rounded-full shadow-[0_0_8px_rgba(0,122,255,0.5)]",
            "transition-all duration-700 ease-out",
            isCursorVisible ? "opacity-100 animate-pulse" : "opacity-0 w-0 ml-0"
          )}
        />
      </span>

      {/* Invisible Text (Space Reservation) */}
      <span className="opacity-0 select-none pointer-events-none">
        {text.slice(displayedIndex)}
      </span>
      
    </div>
  );
}