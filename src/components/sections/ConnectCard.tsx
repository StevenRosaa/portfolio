import { BentoCard } from "@/components/ui/BentoCard";
import Link from "next/link";
import { Github, Linkedin } from "lucide-react";
import { SocialLink } from "@/types";

interface ConnectCardProps {
  socials: SocialLink[];
  email: string;
  className?: string;
}

export function ConnectCard({ socials, email, className }: ConnectCardProps) {
  return (
    <BentoCard className={`${className} flex flex-col justify-center gap-3 bg-white/40`}>
      {socials.map((social) => (
        <Link
          key={social.platform}
          href={social.url}
          target="_blank"
          className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white border border-neutral-100 hover:border-neutral-300 hover:scale-[1.02] transition-all duration-200 group shadow-sm"
        >
          <span className="flex items-center gap-3 font-semibold text-sm text-neutral-700">
            {social.icon === "Github" && <Github size={18} />}
            {social.icon === "Linkedin" && <Linkedin size={18} />}
            {social.platform}
          </span>
        </Link>
      ))}
      <Link
        href={`mailto:${email}`}
        className="flex items-center justify-center px-4 py-3 rounded-2xl bg-neutral-900 text-white font-semibold shadow-lg shadow-neutral-500/20 hover:bg-neutral-800 transition-all hover:scale-[1.02]"
      >
        Contact Me
      </Link>
    </BentoCard>
  );
}