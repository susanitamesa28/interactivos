export type BlockType = "text" | "image" | "video" | "button";

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface TextBlock extends BaseBlock {
  type: "text";
  data: string;
}

export interface ImageBlock extends BaseBlock {
  type: "image";
  data: {
    src: string;
    alt: string;
  };
}

export interface VideoBlock extends BaseBlock {
  type: "video";
  data: {
    src: string;
  };
}

export interface ButtonBlock extends BaseBlock {
  type: "button";
  data: {
    label: string;
    url: string;
  };
}

export type Block = TextBlock | ImageBlock | VideoBlock | ButtonBlock;

export interface Tab {
  id: string;
  title: string;
  content: string;
  blocks: Block[];
}

export interface InteractiveProject {
  id?: string;
  title: string;
  description: string;
  tabs: Tab[];
}