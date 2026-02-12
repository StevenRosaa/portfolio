export function StatusHeader() {
  return (
    <div className="mb-8 flex items-center justify-between">
      <h2 className="text-xl font-bold tracking-tight text-neutral-900 hidden md:block">
        Dashboard
      </h2>
      <div className="flex items-center gap-2 text-sm text-neutral-500 font-medium bg-white/50 border border-white/60 px-4 py-2 rounded-full shadow-sm backdrop-blur-md ml-auto">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        Open to Work
      </div>
    </div>
  );
}