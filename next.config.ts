import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // <--- QUESTA RIGA È FONDAMENTALE
  images: {
    unoptimized: true, // Necessario per l'export statico se usi <Image />
     },
};

export default nextConfig;
