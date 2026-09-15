"use client";
import { ReactNode } from "react";

interface CanvasProps {
  children: ReactNode;
}

export default function Canvas({ children }: CanvasProps) {
  return (
    <main className="flex-1 bg-gray-100 p-8 overflow-auto">
      <div className="max-w-6xl mx-auto">
        {children}
      </div>
    </main>
  );
}