"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { Loader2 } from "lucide-react";

export default function MapWrapper({ center, zoom }: { center: [number, number]; zoom?: number }) {
  
  // Memoize the dynamic import to prevent re-loading the map on every render
  const Map = useMemo(() => dynamic(
    () => import("@/components/ui/Map"),
    { 
      ssr: false, // Leaflet requires window, so we disable SSR
      loading: () => (
        <div className="w-full h-full bg-neutral-100 rounded-[32px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
        </div>
      )
    }
  ), []);

  return <Map center={center} zoom={zoom} />;
}