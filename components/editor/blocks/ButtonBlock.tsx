"use client";

import { ButtonBlock as ButtonBlockType } from "@/types/interactive";

interface ButtonBlockProps {
  block: ButtonBlockType;
  primaryColor: string;
  secondaryColor: string;
}

export default function ButtonBlock({
  block,
  primaryColor,
  secondaryColor,
}: ButtonBlockProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow">
   <a
  href={block.data.url || "#"}
  target="_blank"
  rel="noopener noreferrer"
  className="inline-block rounded-lg px-4 py-2 text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
  style={{
    backgroundColor: primaryColor,
    outlineColor: secondaryColor,
  }}
>
  {block.data.label || "Botón"}
</a>
    </div>
  );
}