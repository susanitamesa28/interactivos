"use client";

import { TextBlock as TextBlockType } from "@/types/interactive";

interface TextBlockProps {
  block: TextBlockType;
  secondaryColor: string;
}

export default function TextBlock({
  block,
  secondaryColor,
}: TextBlockProps) {
  return (
 <div
  className="rounded-xl bg-white p-6 shadow"
  style={{ borderColor: secondaryColor, borderWidth: "1px" }}
>
      <p className="text-gray-900">{block.data}</p>
    </div>
  );
}