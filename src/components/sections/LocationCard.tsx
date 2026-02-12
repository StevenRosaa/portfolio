import { BentoCard } from "@/components/ui/BentoCard";
import MapWrapper from "@/components/ui/MapWrapper";

interface LocationCardProps {
  location: string;
  className?: string;
}

export function LocationCard({ location, className }: LocationCardProps) {
  return (
    <BentoCard className={`${className} min-h-[250px] p-0 relative overflow-hidden group border-0`}>
      <div className="absolute inset-0 z-0">
        {/* Trento coordinates */}
        <MapWrapper center={[46.0697, 11.1211]} zoom={12} />
        
        {/* Bottom gradient overlay for better text readability */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white via-white/80 to-transparent z-[400] pointer-events-none" />
      </div>
      
      <div className="relative z-[500] h-full flex flex-col justify-end p-6 pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="bg-green-100/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-green-200 shadow-sm flex items-center gap-2">
            <span className="text-xs font-bold text-green-700 uppercase tracking-wide">
              Availability: Hybrid/Remote
            </span>
          </div>
        </div>
      </div>
    </BentoCard>
  );
}