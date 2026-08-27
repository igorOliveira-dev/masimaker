"use client";

import { useEditorStore } from "@/app/stores/editorStore";
import type { ComponentItem } from "@/app/stores/editorStore";

interface ImageInspectorProps {
  component: ComponentItem;
  sectionId: string;
}

const ImageInspector = ({ component, sectionId }: ImageInspectorProps) => {
  const updateComponent = useEditorStore((s) => s.updateComponent);
  const { attributes } = component;

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-xs">
        Image URL
        <input
          type="text"
          value={attributes?.src ?? ""}
          onChange={(e) =>
            updateComponent(sectionId, component.id, {
              attributes: { ...attributes, src: e.target.value },
            })
          }
          placeholder="https://..."
          className="h-8 px-2 rounded border border-(--foreground)/10 bg-transparent text-sm"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs">
        Alt text
        <input
          type="text"
          value={attributes?.alt ?? ""}
          onChange={(e) =>
            updateComponent(sectionId, component.id, {
              attributes: { ...attributes, alt: e.target.value },
            })
          }
          className="h-8 px-2 rounded border border-(--foreground)/10 bg-transparent text-sm"
        />
      </label>

      <div className="flex gap-2">
        <label className="flex flex-col gap-1 text-xs flex-1">
          Width
          <input
            type="text"
            value={attributes?.width ?? "100%"}
            onChange={(e) =>
              updateComponent(sectionId, component.id, {
                attributes: { ...attributes, width: e.target.value },
              })
            }
            className="h-8 px-2 rounded border border-(--foreground)/10 bg-transparent text-sm"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs flex-1">
          Height
          <input
            type="text"
            value={attributes?.height ?? "auto"}
            onChange={(e) =>
              updateComponent(sectionId, component.id, {
                attributes: { ...attributes, height: e.target.value },
              })
            }
            className="h-8 px-2 rounded border border-(--foreground)/10 bg-transparent text-sm"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-xs">
        Object fit
        <select
          value={attributes?.objectFit ?? "cover"}
          onChange={(e) =>
            updateComponent(sectionId, component.id, {
              attributes: { ...attributes, objectFit: e.target.value },
            })
          }
          className="h-8 px-2 rounded border border-(--foreground)/10 bg-transparent text-sm"
        >
          <option value="cover">Cover</option>
          <option value="contain">Contain</option>
          <option value="fill">Fill</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs">
        Border radius (px)
        <input
          type="number"
          min={0}
          value={attributes?.borderRadius ?? 0}
          onChange={(e) =>
            updateComponent(sectionId, component.id, {
              attributes: { ...attributes, borderRadius: Number(e.target.value) },
            })
          }
          className="h-8 px-2 rounded border border-(--foreground)/10 bg-transparent text-sm"
        />
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
    </div>
  );
};

export default ImageInspector;
