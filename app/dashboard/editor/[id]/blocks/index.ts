import { Type, MousePointerClick, Image as ImageIcon } from "lucide-react";
import Text from "./Text";
import TextInspector from "./TextInspector";
import Button from "./Button";
import ButtonInspector from "./ButtonInspector";
import Image from "./Image";
import ImageInspector from "./ImageInspector";
import type { ComponentItem } from "@/app/stores/editorStore";

export type ComponentType = "text" | "button" | "image";

export interface ComponentDefinition {
  type: ComponentType;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  Component: React.ComponentType<{ component: ComponentItem }>;
  Inspector?: React.ComponentType<{
    component: ComponentItem;
    sectionId: string;
  }>;
  defaultAttributes: Record<string, any>;
  defaultColors: Record<string, any>;
}

export const componentRegistry: Record<ComponentType, ComponentDefinition> = {
  text: {
    type: "text",
    label: "Text",
    icon: Type,
    Component: Text,
    Inspector: TextInspector,
    defaultAttributes: { content: "Exemple text", fontSize: 16 },
    defaultColors: { text: "#000000" },
  },
  button: {
    type: "button",
    label: "Button",
    icon: MousePointerClick,
    Component: Button,
    Inspector: ButtonInspector,
    defaultAttributes: {
      label: "Click me",
      href: "#",
      target: "_self",
      fontSize: 16,
      borderRadius: 6,
      paddingX: 16,
      paddingY: 8,
      align: "left",
    },
    defaultColors: { background: "#000000", text: "#ffffff" },
  },
  image: {
    type: "image",
    label: "Image",
    icon: ImageIcon,
    Component: Image,
    Inspector: ImageInspector,
    defaultAttributes: {
      src: "",
      alt: "",
      width: "100%",
      height: "auto",
      objectFit: "cover",
      borderRadius: 0,
      align: "left",
    },
    defaultColors: {},
  },
};

export const componentList = Object.values(componentRegistry);
