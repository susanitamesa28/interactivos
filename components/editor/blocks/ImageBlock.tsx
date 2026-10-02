"use client";

import type { Block } from "@/types/interactive";

interface ImageBlockProps {
  block: Extract<Block, { type: "image" }>;
}

export default function ImageBlock({
  block,
}: ImageBlockProps) {
  return (
    <figure className="w-full rounded-xl bg-white p-4 shadow">
      <div className="flex min-h-[180px] w-full items-center justify-center overflow-hidden rounded-lg bg-gray-50">
        <img
          src={block.data.src}
          alt={block.data.alt || "Imagen del interactivo"}
          loading="lazy"
          className="max-h-[520px] w-full object-contain"
        />
      </div>

      {block.data.alt && (
        <figcaption className="mt-2 text-center text-sm text-gray-600">
          {block.data.alt}
        </figcaption>
      )}
    </figure>
  );
}