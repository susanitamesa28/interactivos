"use client";

import { ImageBlock as ImageBlockType } from "@/types/interactive";

interface ImageBlockProps {
  block: ImageBlockType;
  secondaryColor: string;
}

export default function ImageBlock({
  block,
  secondaryColor,
}: ImageBlockProps) {
  const src = block?.data?.src || "";
  const alt = block?.data?.alt || "Imagen del bloque";

  if (!src) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow">
        Este bloque de imagen no tiene una URL válida.
      </div>
    );
  }

  return (
    <div
  className="rounded-xl bg-white p-6 shadow"
  style={{ borderColor: secondaryColor, borderWidth: "1px" }}
>
      <img
        src={src}
        alt={alt}
        className="w-full rounded-lg object-cover"
      />
    </div>
  );
}