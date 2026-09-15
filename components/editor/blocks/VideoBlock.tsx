"use client";

import { VideoBlock as VideoBlockType } from "@/types/interactive";

interface VideoBlockProps {
  block: VideoBlockType;
  secondaryColor: string;
}

function getYouTubeEmbedUrl(value: string) {
  try {
    const url = new URL(value.trim());

    if (url.hostname === "youtu.be") {
      const videoId = url.pathname.slice(1).split("/")[0];

      return videoId
        ? `https://www.youtube.com/embed/${videoId}`
        : "";
    }

    if (
      url.hostname === "www.youtube.com" ||
      url.hostname === "youtube.com" ||
      url.hostname === "m.youtube.com"
    ) {
      if (url.pathname === "/watch") {
        const videoId = url.searchParams.get("v");

        return videoId
          ? `https://www.youtube.com/embed/${videoId}`
          : "";
      }

      if (url.pathname.startsWith("/embed/")) {
        return value.trim();
      }
    }

    return "";
  } catch {
    return "";
  }
}

export default function VideoBlock({
  block,
  secondaryColor,
}: VideoBlockProps) {
  const src = block.data.src.trim();
  const embedUrl = getYouTubeEmbedUrl(src);

  if (!src) {
    return (
      <div
        className="rounded-lg border border-dashed bg-gray-50 p-4 text-sm text-gray-600"
        style={{ borderColor: secondaryColor }}
      >
        Agrega una URL de YouTube en el panel de edición.
      </div>
    );
  }

  if (!embedUrl) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        La URL del video no es válida. Usa un enlace de YouTube como:
        <br />
        <code className="mt-1 inline-block">
          https://www.youtube.com/watch?v=VIDEO_ID
        </code>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-black">
      <iframe
        src={embedUrl}
        title="Video de YouTube"
        width="100%"
        height="400"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        style={{ borderColor: secondaryColor }}
      />
    </div>
  );
}