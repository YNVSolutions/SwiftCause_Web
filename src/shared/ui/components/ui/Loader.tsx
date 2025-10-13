import React from "react";

interface LoaderProps {
  message?: string;
}

export function Loader({ message = "Loading application..." }: LoaderProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <img src="/logo.png" alt="SwiftCause" className="h-16 w-16 rounded-xl shadow" />
        <div className="flex items-center gap-2">
          <span className="sr-only">{message}</span>
          <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-gray-700 text-sm sm:text-base">{message}</p>
        </div>
      </div>
    </div>
  );
}


