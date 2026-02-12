"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Typewriter } from "@/components/ui/Typewriter";
import { ProfileData } from "@/types";

interface HeroProps {
  profile: ProfileData;
}

export function Hero({ profile }: HeroProps) {
  return (
    <div className="relative h-full w-full overflow-hidden">
        {/* Decorative fixed background gradient */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-3xl -z-10 opacity-60 pointer-events-none" />

        {/* Main Flex Container.
            We do not use the 'layout' prop here to avoid conflicts with Typewriter re-renders.
            Layout stability is handled by the Ghost Text strategy below.
        */}
        <div className="flex flex-col h-full justify-center p-8 md:p-12 gap-8 z-10">
                
            {/* --- HEADER: AVATAR + TITLE --- */}
            <div className="flex flex-col md:flex-row items-center md:items-center gap-6 md:gap-8 w-full">
            
                {/* Avatar Image with Motion */}
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "backOut" }}
                    className="relative shrink-0 group"
                >
                    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl rotate-2 group-hover:rotate-0 transition-all duration-500 ease-out">
                        <Image 
                            src={profile.avatar} 
                            alt={profile.name} 
                            fill 
                            className="object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
                            priority
                        />
                    </div>
                    {/* Online Status Badge */}
                    <div className="absolute -bottom-2 -right-2 bg-white px-3 py-1 rounded-full shadow-md border border-gray-100 flex items-center gap-2 z-10">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider">Online</span>
                    </div>
                </motion.div>

                {/* Title and Subtitle */}
                <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-center md:text-left space-y-2"
                >
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tighter text-neutral-900 leading-[0.9] text-balance">
                        Hi, I'm <br />{profile.name.split(" ")[0]}.
                    </h1>
                    <p className="text-sm font-semibold text-neutral-400 uppercase tracking-widest pl-1">
                        Creative Developer
                    </p>
                </motion.div>
            
            </div>

            {/* --- BIOGRAPHY SECTION --- */}
            <div className="w-full max-w-2xl mx-auto md:mx-0 relative">
                
                {/* Ghost Element:
                    Invisible copy of the full text to reserve DOM space and prevent layout shifts/jank.
                */}
                <div className="text-lg md:text-xl font-medium leading-relaxed text-center md:text-left opacity-0 select-none pointer-events-none" aria-hidden="true">
                    {profile.bio}
                </div>

                {/* Visible Element:
                    Absolute positioned Typewriter component overlying the ghost text.
                */}
                <div className="absolute top-0 left-0 w-full h-full text-lg md:text-xl text-neutral-500 font-medium leading-relaxed text-center md:text-left">
                    <Typewriter text={profile.bio} speed={25} delay={800} />
                </div>

            </div>

        </div>
    </div>
  );
}