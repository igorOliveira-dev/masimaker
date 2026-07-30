import { Type } from "lucide-react";
import Text from "./Text";
import TextInspector from "./TextInspector";
import type { ComponentItem } from "@/app/stores/editorStore";

export type ComponentType = "text";

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
};

export const componentList = Object.values(componentRegistry);
