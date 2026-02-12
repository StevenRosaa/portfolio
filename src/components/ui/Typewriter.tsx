"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TypewriterProps {
  text: string;
  speed?: number; // Typing speed in milliseconds per character
  delay?: number; // Initial delay before typing starts
}

export function Typewriter({ text, speed = 30, delay = 500 }: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    // Reset state when props change to handle navigation or prop updates
    setDisplayedText("");
    setIsComplete(false);
    setHasStarted(false);

    // Handle initial start delay
    const startTimeout = setTimeout(() => {
      setHasStarted(true);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [text, delay]);

  useEffect(() => {
    if (!hasStarted) return;

    let currentIndex = 0;
    
    // Typing interval logic
    const intervalId = setInterval(() => {
      if (currentIndex < text.length) {
        // Using slice ensures text consistency across re-renders/strict mode
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(intervalId);
        setIsComplete(true);
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed, hasStarted]);

  return (
    <span className="whitespace-pre-wrap font-mono md:font-sans">
      {displayedText}
      
      {/* Blinking Cursor with Exit Animation */}
      <AnimatePresence>
        {!isComplete && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0, transition: { duration: 0.3 } }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
            className="inline-block w-[3px] h-[1.2em] bg-blue-500 ml-1 align-bottom rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]"
          />
        )}
      </AnimatePresence>
    </span>
  );
}