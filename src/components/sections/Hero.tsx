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
    <div className="relative w-full h-full">
        
        {/* Sfondo decorativo */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-3xl -z-10 opacity-60 pointer-events-none" />

        {/* Flex Container */}
        <div className="flex flex-col min-h-full justify-center p-6 md:p-12 gap-8 z-10 relative">
                
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 w-full">
                
                {/* Avatar */}
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "backOut" }}
                    className="relative shrink-0 group"
                >
                    <div className="relative w-28 h-28 md:w-40 md:h-40 rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl rotate-2 group-hover:rotate-0 transition-all duration-500 ease-out">
                        <Image 
                            src={profile.avatar} 
                            alt={profile.name} 
                            fill 
                            className="object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
                            priority
                        />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-white px-3 py-1 rounded-full shadow-md border border-gray-100 flex items-center gap-2 z-10">
                         <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider">Online</span>
                    </div>
                </motion.div>

                {/* Title */}
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
            <div className="w-full max-w-2xl mx-auto md:mx-0">
                <div className="text-lg md:text-xl text-neutral-500 font-medium leading-relaxed text-center md:text-left min-h-[100px]">
                    <Typewriter 
                        text={profile.bio} 
                        speed={25} 
                        delay={800} 
                    />
                </div>
            </div>

        </div>
    </div>
  );
}