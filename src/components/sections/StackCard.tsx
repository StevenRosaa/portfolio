import { BentoCard } from "@/components/ui/BentoCard";
import { Gamepad2, Code2, BrainCircuit } from "lucide-react";

interface StackCardProps {
  className?: string;
}

export function StackCard({ className }: StackCardProps) {
  return (
    <BentoCard className={`${className} flex flex-col justify-center bg-white/40`}>
      <div className="space-y-6">
        
        {/* Role 1: Game Dev */}
        <div className="group flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl group-hover:scale-110 transition-transform border border-orange-100">
            <Gamepad2 size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-neutral-800">Game Developer and Designer</h3>
            <p className="text-sm text-neutral-500">Unity, Unreal & C# Logic</p>
          </div>
        </div>

        {/* Role 2: Full Stack */}
        <div className="group flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform border border-blue-100">
            <Code2 size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-neutral-800">Full Stack Dev</h3>
            <p className="text-sm text-neutral-500">React, Next.js & Scalable Systems</p>
          </div>
        </div>

        {/* Role 3: AI */}
        <div className="group flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl group-hover:scale-110 transition-transform border border-purple-100">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-neutral-800">AI Enthusiast</h3>
            <p className="text-sm text-neutral-500">LLMs, Python & Neural Networks</p>
          </div>
        </div>

      </div>
    </BentoCard>
  );
}