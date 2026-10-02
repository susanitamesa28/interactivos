"use client";

import type {
  Block,
  ButtonBlock,
  ImageBlock,
  Tab,
  TextBlock,
  VideoBlock,
} from "@/types/interactive";

type ImageField =
  | "src"
  | "alt"
  | "size"
  | "alignment"
  | "fit";

interface BlockManagerProps {
  blocks: Tab["blocks"];

  onUpdateBlock: (
    blockId: string,
    value: string
  ) => void;

  onUpdateImageBlock: (
    blockId: string,
    field: ImageField,
    value: string
  ) => void;

  onAddBlock: (block: Block) => void;
  onRemoveBlock: (blockId: string) => void;
  onMoveBlock: (
    blockId: string,
    direction: "up" | "down"
  ) => void;

  onUpdateButtonBlock: (
    blockId: string,
    field: "label" | "url",
    value: string
  ) => void;
}

export default function BlockManager({
  blocks,
  onUpdateBlock,
  onUpdateImageBlock,
  onAddBlock,
  onRemoveBlock,
  onMoveBlock,
  onUpdateButtonBlock,
}: BlockManagerProps) {
  function addTextBlock() {
    onAddBlock({
      id: crypto.randomUUID(),
      type: "text",
      data: "Nuevo bloque de texto",
    } satisfies TextBlock);
  }

  function addImageBlock() {
    onAddBlock({
      id: crypto.randomUUID(),
      type: "image",
      data: {
        src: "",
        alt: "",
        size: "large",
        alignment: "center",
        fit: "contain",
      },
    } satisfies ImageBlock);
  }

  function addButtonBlock() {
    onAddBlock({
      id: crypto.randomUUID(),
      type: "button",
      data: {
        label: "Nuevo botón",
        url: "https://example.com",
      },
    } satisfies ButtonBlock);
  }

  function addVideoBlock() {
    onAddBlock({
      id: crypto.randomUUID(),
      type: "video",
      data: {
        src: "",
      },
    } satisfies VideoBlock);
  }

  function updateTextBlock(
    blockId: string,
    value: string
  ) {
    onUpdateBlock(blockId, value);
  }

  function updateImageBlock(
    blockId: string,
    field: ImageField,
    value: string
  ) {
    onUpdateImageBlock(blockId, field, value);
  }

  function updateVideoBlock(
    blockId: string,
    value: string
  ) {
    onUpdateBlock(blockId, value);
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
        <div className="mt-4 rounded border border-dashed bg-blue-300 p-3 text-sm text-blue-700">
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
              <div className="font-medium capitalize">
                {block.type}
              </div>

              <div className="flex items-center gap-3">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      onMoveBlock(block.id, "up")
                    }
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Subir
                  </button>
                )}

                {index < blocks.length - 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      onMoveBlock(block.id, "down")
                    }
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Bajar
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onRemoveBlock(block.id)}
                  className="text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </div>

            {block.type === "text" && (
              <label className="mt-2 block">
                <span className="mb-1 block text-xs text-blue-700">
                  Contenido
                </span>

                <textarea
                  value={block.data}
                  onChange={(event) =>
                    updateTextBlock(
                      block.id,
                      event.target.value
                    )
                  }
                  rows={3}
                  className="w-full rounded border p-2"
                />
              </label>
            )}

            {block.type === "image" && (
              <div className="mt-2 space-y-3">
                <label className="block">
                  <span className="mb-1 block text-xs text-blue-700">
                    URL de la imagen
                  </span>

                  <input
                    type="url"
                    value={block.data.src}
                    onChange={(event) =>
                      updateImageBlock(
                        block.id,
                        "src",
                        event.target.value
                      )
                    }
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="w-full rounded border border-blue-300 p-2 text-blue-900"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs text-blue-700">
                    Texto alternativo
                  </span>

                  <input
                    type="text"
                    value={block.data.alt ?? ""}
                    onChange={(event) =>
                      updateImageBlock(
                        block.id,
                        "alt",
                        event.target.value
                      )
                    }
                    placeholder="Descripción de la imagen"
                    className="w-full rounded border border-blue-300 p-2 text-blue-900"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs text-blue-700">
                    Tamaño
                  </span>

                  <select
                    value={block.data.size ?? "large"}
                    onChange={(event) =>
                      updateImageBlock(
                        block.id,
                        "size",
                        event.target.value
                      )
                    }
                    className="w-full rounded border border-blue-300 bg-white p-2 text-blue-900"
                  >
                    <option value="small">Pequeña</option>
                    <option value="medium">Mediana</option>
                    <option value="large">Grande</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs text-blue-700">
                    Alineación
                  </span>

                  <select
                    value={block.data.alignment ?? "center"}
                    onChange={(event) =>
                      updateImageBlock(
                        block.id,
                        "alignment",
                        event.target.value
                      )
                    }
                    className="w-full rounded border border-blue-300 bg-white p-2 text-blue-900"
                  >
                    <option value="left">Izquierda</option>
                    <option value="center">Centro</option>
                    <option value="right">Derecha</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs text-blue-700">
                    Ajuste
                  </span>

                  <select
                    value={block.data.fit ?? "contain"}
                    onChange={(event) =>
                      updateImageBlock(
                        block.id,
                        "fit",
                        event.target.value
                      )
                    }
                    className="w-full rounded border border-blue-300 bg-white p-2 text-blue-900"
                  >
                    <option value="contain">Completa</option>
                    <option value="cover">Recortada</option>
                  </select>
                </label>
              </div>
            )}

            {block.type === "button" && (
              <div className="mt-2 space-y-2">
                <label className="block">
                  <span className="mb-1 block text-xs text-blue-700">
                    Texto del botón
                  </span>

                  <input
                    type="text"
                    value={block.data.label}
                    onChange={(event) =>
                      onUpdateButtonBlock(
                        block.id,
                        "label",
                        event.target.value
                      )
                    }
                    className="w-full rounded border p-2"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs text-blue-700">
                    URL del botón
                  </span>

                  <input
                    type="url"
                    value={block.data.url}
                    onChange={(event) =>
                      onUpdateButtonBlock(
                        block.id,
                        "url",
                        event.target.value
                      )
                    }
                    className="w-full rounded border p-2"
                  />
                </label>
              </div>
            )}

            {block.type === "video" && (
              <label className="mt-2 block">
                <span className="mb-1 block text-xs text-blue-700">
                  URL del video de YouTube
                </span>

                <input
                  type="url"
                  value={block.data.src}
                  onChange={(event) =>
                    updateVideoBlock(
                      block.id,
                      event.target.value
                    )
                  }
                  placeholder="https://www.youtube.com/embed/VIDEO_ID"
                  className="w-full rounded border border-blue-300 p-2 text-blue-900"
                />
              </label>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}