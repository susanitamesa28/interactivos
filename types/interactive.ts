export type TextBlock = {
  id: string;
  type: "text";
  data: string;
};

export type ImageBlock = {
  id: string;
  type: "image";
  data: {
    src: string;
    alt: string;
    size?: "small" | "medium" | "large";
    alignment?: "left" | "center" | "right";
    fit?: "contain" | "cover";
  };
};

export type ButtonBlock = {
  id: string;
  type: "button";
  data: {
    label: string;
    url: string;
  };
};

export type VideoBlock = {
  id: string;
  type: "video";
  data: {
    src: string;
  };
};

export type Block =
  | TextBlock
  | ImageBlock
  | ButtonBlock
  | VideoBlock;

export type Tab = {
  id: string;
  title: string;
  content: string;
  blocks: Block[];
};