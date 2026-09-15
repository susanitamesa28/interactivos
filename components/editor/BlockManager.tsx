"use client";

import {
  Block,
  ButtonBlock,
  ImageBlock,
  TextBlock,
  VideoBlock,
} from "@/types/interactive";

interface BlockManagerProps {
  blocks: Block[];
  setBlocks: (blocks: Block[]) => void;
}

export default function BlockManager({
  blocks,
  setBlocks,
}: BlockManagerProps) {
  function addTextBlock() {
    const newBlock: TextBlock = {
      id: crypto.randomUUID(),
      type: "text",
      data: "Nuevo bloque de texto",
    };

    setBlocks([...blocks, newBlock]);
  }

  function addImageBlock() {
    const newBlock: ImageBlock = {
      id: crypto.randomUUID(),
      type: "image",
      data: {
        src: "",
        alt: "",
      },
    };

    setBlocks([...blocks, newBlock]);
  }

  function addButtonBlock() {
    const newBlock: ButtonBlock = {
      id: crypto.randomUUID(),
      type: "button",
      data: {
        label: "Nuevo botón",
        url: "https://example.com",
      },
    };

    setBlocks([...blocks, newBlock]);
  }

  function addVideoBlock() {
    const newBlock: VideoBlock = {
      id: crypto.randomUUID(),
      type: "video",
      data: {
        src: "",
      },
    };

    setBlocks([...blocks, newBlock]);
  }

  function updateTextBlock(id: string, value: string) {
    const updatedBlocks = blocks.map((block) =>
      block.id === id && block.type === "text"
        ? { ...block, data: value }
        : block
    );

    setBlocks(updatedBlocks);
  }

  function updateImageBlock(
    id: string,
    field: "src" | "alt",
    value: string
  ) {
    const updatedBlocks = blocks.map((block) =>
      block.id === id && block.type === "image"
        ? {
            ...block,
            data: {
              ...block.data,
              [field]: value,
            },
          }
        : block
    );

    setBlocks(updatedBlocks);
  }

  function updateButtonBlock(
    id: string,
    field: "label" | "url",
    value: string
  ) {
    const updatedBlocks = blocks.map((block) =>
      block.id === id && block.type === "button"
        ? {
            ...block,
            data: {
              ...block.data,
              [field]: value,
            },
          }
        : block
    );

    setBlocks(updatedBlocks);
  }

  function updateVideoBlock(id: string, value: string) {
    const updatedBlocks = blocks.map((block) =>
      block.id === id && block.type === "video"
        ? {
            ...block,
            data: {
              ...block.data,
              src: value,
            },
          }
        : block
    );

    setBlocks(updatedBlocks);
  }

  function removeBlock(id: string) {
    const updatedBlocks = blocks.filter((block) => block.id !== id);
    setBlocks(updatedBlocks);
  }

  function moveBlockUp(index: number) {
    if (index === 0) return;

    const updatedBlocks = [...blocks];
    const temp = updatedBlocks[index - 1];
    updatedBlocks[index - 1] = updatedBlocks[index];
    updatedBlocks[index] = temp;

    setBlocks(updatedBlocks);
  }

  function moveBlockDown(index: number) {
    if (index === blocks.length - 1) return;

    const updatedBlocks = [...blocks];
    const temp = updatedBlocks[index + 1];
    updatedBlocks[index + 1] = updatedBlocks[index];
    updatedBlocks[index] = temp;

    setBlocks(updatedBlocks);
  }

  return (
    <div className="mt-4 border-t pt-4">
      <h3 className="mb-3 font-bold">Bloques</h3>

      <div className="space-y-2">
        <button
          type="button"
          onClick={addTextBlock}
          className="w-full rounded border p-2 hover:bg-blue-300"
        >
          + Texto
        </button>

        <button
          type="button"
          onClick={addImageBlock}
          className="w-full rounded border p-2 hover:bg-blue-300"
        >
          + Imagen
        </button>

        <button
          type="button"
          onClick={addButtonBlock}
          className="w-full rounded border p-2 hover:bg-blue-300"
        >
          + Botón
        </button>

        <button
          type="button"
          onClick={addVideoBlock}
          className="w-full rounded border p-2 hover:bg-blue-300"
        >
          + Video
        </button>
      </div>

      {blocks.length === 0 && (
        <div className="mt-4 rounded border border-dashed bg-blue-300 p-3 text-sm text-blue-500">
          Esta pestaña no tiene bloques todavía.
        </div>
      )}

      <div className="mt-4 space-y-3">
        {blocks.map((block, index) => (
          <div
            key={block.id}
            className="rounded border bg-white p-3 text-sm"
          >
            <div className="flex items-center justify-between">
              <div className="font-medium capitalize">{block.type}</div>

              <div className="flex items-center gap-3">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => moveBlockUp(index)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Subir
                  </button>
                )}

                {index < blocks.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveBlockDown(index)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Bajar
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => removeBlock(block.id)}
                  className="text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </div>

            {block.type === "text" && (
              <label className="mt-2 block">
                <span className="mb-1 block text-xs text-blue-500">
                  Contenido
                </span>
                <textarea
                  value={block.data}
                  onChange={(e) => updateTextBlock(block.id, e.target.value)}
                  rows={3}
                  className="w-full rounded border p-2"
                />
              </label>
            )}

            {block.type === "image" && (
              <div className="mt-2 space-y-2">
                <label className="block">
                  <span className="mb-1 block text-xs text-blue-500">
                    URL de la imagen
                  </span>
                 <input
  type="url"
  value={block.data.src}
  onChange={(e) =>
    updateImageBlock(block.id, "src", e.target.value)
  }
  placeholder="https://ejemplo.com/imagen.jpg"
  aria-label="URL de la imagen"
  className="w-full rounded border border-blue-300 p-2 text-blue-900 placeholder:text-blue-600"
/>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs text-blue-500">
                    Texto alternativo
                  </span>
                  <input
  type="text"
  value={block.data.alt}
  onChange={(e) =>
    updateImageBlock(block.id, "alt", e.target.value)
  }
  placeholder="Descripción de la imagen"
  aria-label="Texto alternativo de la imagen"
  className="w-full rounded border border-blue-300 p-2 text-blue-900 placeholder:text-blue-600"
/>
                </label>
              </div>
            )}

            {block.type === "button" && (
              <div className="mt-2 space-y-2">
                <label className="block">
                  <span className="mb-1 block text-xs text-blue-500">
                    Texto del botón
                  </span>
                  <input
                    type="text"
                    value={block.data.label}
                    onChange={(e) =>
                      updateButtonBlock(block.id, "label", e.target.value)
                    }
                    className="w-full rounded border p-2"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs text-blue-900">
                    URL del botón
                  </span>
                  <input
                    type="text"
                    value={block.data.url}
                    onChange={(e) =>
                      updateButtonBlock(block.id, "url", e.target.value)
                    }
                    className="w-full rounded border p-2"
                  />
                </label>
              </div>
            )}

            {block.type === "video" && (
              <label className="mt-2 block">
                <span className="mb-1 block text-xs text-blue-900">
                  URL del video de YouTube
                </span>
                <input
  type="url"
  value={block.data.src}
  onChange={(e) => updateVideoBlock(block.id, e.target.value)}
  placeholder="https://www.youtube.com/embed/VIDEO_ID"
  aria-label="URL del video de YouTube"
  className="w-full rounded border border-blue-300 p-2 text-blue-600 placeholder:text-blue-900"
/>
              </label>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}