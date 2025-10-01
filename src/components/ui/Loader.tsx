import React from "react";

export function Loader() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <img src="/logo.png" alt="Logo" className="h-12 w-12 rounded-xl shadow-md" />
        <div className="relative">
          <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-[var(--primary)] via-[var(--chart-3)] to-[var(--chart-2)] animate-spin [animation-duration:1.2s]"></div>
          <div className="absolute inset-1 bg-background rounded-full"></div>
          <div className="absolute inset-3 rounded-full bg-gradient-to-tr from-[color:oklch(0.985_0_0)/.15] via-[var(--chart-3)]/15 to-[var(--chart-2)]/15 blur"></div>
        </div>
        <div className="flex items-center gap-2 text-foreground">
          <span className="text-sm tracking-wide">Loading</span>
          <span className="flex gap-1">
            <span className="w-1 h-1 rounded-full bg-foreground/40 animate-bounce [animation-delay:0ms]"></span>
            <span className="w-1 h-1 rounded-full bg-foreground/40 animate-bounce [animation-delay:150ms]"></span>
            <span className="w-1 h-1 rounded-full bg-foreground/40 animate-bounce [animation-delay:300ms]"></span>
          </span>
        </div>
      </div>
    </div>
  );
}


