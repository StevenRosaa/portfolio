"use client";

import React, { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { Project } from "@/types";
import { ArrowUpRight, Github, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectSliderProps {
  projects: Project[];
}

export function ProjectSlider({ projects }: ProjectSliderProps) {
  // Embla Carousel configuration: Infinite loop, Autoplay with interaction stop
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 6000, stopOnInteraction: true }),
  ]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!projects || projects.length === 0) return null;

  return (
    <div className="relative group w-full h-full overflow-hidden rounded-[32px] bg-neutral-100 shadow-sm border border-white/20">
      
      {/* --- NAVIGATION CONTROLS (Top Right) --- */}
      {/* High z-index to stay above the image. Absolute positioning. */}
      <div className="absolute top-6 right-6 z-20 flex gap-2">
        <button 
            onClick={scrollPrev}
            className="w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md flex items-center justify-center text-white transition-all border border-white/10 active:scale-95"
            aria-label="Previous Slide"
        >
            <ChevronLeft size={20} />
        </button>
        <button 
            onClick={scrollNext}
            className="w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md flex items-center justify-center text-white transition-all border border-white/10 active:scale-95"
            aria-label="Next Slide"
        >
            <ChevronRight size={20} />
        </button>
      </div>

      {/* --- SLIDER VIEWPORT --- */}
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full touch-pan-y">
          {projects.map((project, index) => (
            <div
              key={project.slug}
              className="relative flex-[0_0_100%] min-w-0 h-[500px] md:h-full"
            >
              {/* Project Image */}
              <div className="absolute inset-0">
                <Image
                  src={project.coverImage}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  priority={index === 0}
                />
                {/* Gradient overlay to improve text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              </div>

              {/* Text Content (Bottom Left) */}
              <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 text-white z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  
                  {/* Project Info */}
                  <div className="space-y-4 max-w-2xl">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                        {project.tags?.map(tag => (
                            <span key={tag} className="px-3 py-1 text-xs font-medium bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-neutral-200">
                                {tag}
                            </span>
                        ))}
                    </div>
                    
                    {/* Title & Description */}
                    <div>
                        <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 text-white">
                            {project.title}
                        </h3>
                        <p className="text-neutral-300 text-base md:text-lg line-clamp-2 leading-relaxed">
                            {project.description}
                        </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 shrink-0">
                    
                    {/* GitHub Button (if link exists) */}
                    {project.linkRepo && (
                        <Link 
                            href={project.linkRepo}
                            target="_blank"
                            className="p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white hover:text-black transition-all border border-white/20"
                            title="View Code"
                        >
                            <Github size={20} />
                        </Link>
                    )}

                    {/* Live Demo Button Logic */}
                    {project.linkDemo ? (
                         // CASE 1: Link Exists -> Active White Button
                         <Link
                         href={project.linkDemo}
                         target="_blank"
                         className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold hover:bg-neutral-200 transition-colors shadow-lg shadow-black/20"
                       >
                         Live Demo <ArrowUpRight size={18} />
                       </Link>
                    ) : (
                        // CASE 2: Link Missing -> Disabled Grey Button
                        <button 
                            disabled 
                            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 text-neutral-400 font-medium backdrop-blur-md border border-white/5 cursor-not-allowed opacity-80"
                        >
                            <Lock size={16} /> Coming Soon
                        </button>
                    )}
                   
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}