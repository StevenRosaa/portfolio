import { cn } from "@/lib/utils";

export function BackgroundBlobs() {
  return (
    <div className="fixed inset-0 w-full h-full -z-50 bg-[#F5F5F7]">
      
      {/* 1. Aurora Gradient Layer */}
      <div 
        className={cn(
            "absolute inset-0 opacity-40",
            "animate-aurora", // Animation class defined in globals.css
            "[background-image:var(--gradient-mesh)]",
            "[background-size:300%_100%]"
        )}
        style={{
            // Define large overlapping radial gradients to create the mesh effect.
            "--gradient-mesh": `
                radial-gradient(at 10% 10%, hsla(250,90%,75%,1) 0px, transparent 50%),
                radial-gradient(at 90% 0%, hsla(200,98%,70%,1) 0px, transparent 50%),
                radial-gradient(at 90% 90%, hsla(320,90%,75%,1) 0px, transparent 50%),
                radial-gradient(at 10% 90%, hsla(270,90%,75%,1) 0px, transparent 50%),
                radial-gradient(at 50% 50%, hsla(220,90%,75%,1) 0px, transparent 50%)
            `
        } as React.CSSProperties}
      />

      {/* 2. Heavy Blur Layer to blend gradients */}
      <div className="absolute inset-0 backdrop-blur-[100px]" />

      {/* 3. Noise Overlay texture */}
      <div className="hidden md:block absolute inset-0 bg-noise opacity-[0.06] mix-blend-overlay pointer-events-none" />
      
    </div>
  );
}