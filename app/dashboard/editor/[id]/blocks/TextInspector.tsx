"use client";

import { useEditorStore } from "@/app/stores/editorStore";
import type { ComponentItem } from "@/app/stores/editorStore";

interface TextInspectorProps {
  component: ComponentItem;
  sectionId: string;
}

const TextInspector = ({ component, sectionId }: TextInspectorProps) => {
  const updateComponent = useEditorStore((s) => s.updateComponent);
  const { attributes, colors } = component;

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-xs">
        Content
        <textarea
          value={attributes?.content ?? ""}
          onChange={(e) =>
            updateComponent(sectionId, component.id, {
              attributes: { ...attributes, content: e.target.value },
            })
          }
          rows={3}
          className="px-2 py-1 rounded border border-(--foreground)/10 bg-transparent text-sm resize-none"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs">
        Font size (px)
        <input
          type="number"
          min={1}
          value={attributes?.fontSize ?? 16}
          onChange={(e) =>
            updateComponent(sectionId, component.id, {
              attributes: { ...attributes, fontSize: Number(e.target.value) },
            })
          }
          className="h-8 px-2 rounded border border-(--foreground)/10 bg-transparent text-sm"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs">
        Font weight
        <select
          value={attributes?.fontWeight ?? "normal"}
          onChange={(e) =>
            updateComponent(sectionId, component.id, {
              attributes: { ...attributes, fontWeight: e.target.value },
            })
          }
          className="h-8 px-2 rounded border border-(--foreground)/10 bg-transparent text-sm"
        >
          <option value="normal">Normal</option>
          <option value="bold">Bold</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs">
        Align
        <select
          value={attributes?.align ?? "left"}
          onChange={(e) =>
            updateComponent(sectionId, component.id, {
              attributes: { ...attributes, align: e.target.value },
            })
          }
          className="h-8 px-2 rounded border border-(--foreground)/10 bg-transparent text-sm"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs">
        Text color
        <input
          type="color"
          value={colors?.text ?? "#000000"}
          onChange={(e) =>
            updateComponent(sectionId, component.id, {
              colors: { ...colors, text: e.target.value },
            })
          }
          className="h-8 w-full cursor-pointer rounded border border-(--foreground)/10"
        />
      </label>
    </div>
  );
};

export default TextInspector;
