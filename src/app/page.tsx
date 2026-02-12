import { getProfile, getAllProjects } from "@/lib/markdown";
import { MacWrapper } from "@/components/ui/MacWrapper";
import { BentoCard } from "@/components/ui/BentoCard";

import { Hero } from "@/components/sections/Hero";
import { ProjectSlider } from "@/components/sections/ProjectSlider";
import { StatusHeader } from "@/components/sections/StatusHeader";
import { StackCard } from "@/components/sections/StackCard";
import { LocationCard } from "@/components/sections/LocationCard";
import { ConnectCard } from "@/components/sections/ConnectCard";

export default function Home() {
  const profile = getProfile();
  const projects = getAllProjects();

  return (
    <MacWrapper>
      <main className="py-8 px-4 md:px-12 font-sans">
        <div className="max-w-6xl mx-auto">
          
          {/* 1. HEADER (Status and Title) */}
          <StatusHeader />

          {/* 2. GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[auto]">
            
            {/* A. HERO SECTION */}
            <BentoCard className="col-span-1 md:col-span-2 lg:col-span-2 row-span-1 md:row-span-2 bg-gradient-to-br from-white via-white to-gray-50 p-0 overflow-hidden relative border-0">
              <Hero profile={profile} />
            </BentoCard>

            {/* B. TECH STACK / PILLARS */}
            <StackCard className="col-span-1 md:col-span-1 lg:col-span-2 row-span-1" />

            {/* C. MAP */}
            <LocationCard 
              location={profile.location} 
              className="col-span-1" 
            />

            {/* D. SOCIALS & CONTACT */}
            <ConnectCard 
              socials={profile.socials} 
              email={profile.email} 
              className="col-span-1" 
            />

            {/* E. PROJECTS (SLIDER) */}
            <div className="col-span-1 md:col-span-3 lg:col-span-4 row-span-2 min-h-[500px]">
              <ProjectSlider projects={projects} />
            </div>

          </div>

          {/* 3. FOOTER */}
          <div className="mt-12 text-center text-xs text-neutral-400 pb-4">
            © {new Date().getFullYear()} {profile.name}. Built with Next.js & Tailwind.
          </div>

        </div>
      </main>
    </MacWrapper>
  );
}