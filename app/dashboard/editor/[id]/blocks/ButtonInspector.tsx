"use client";

import { useEditorStore } from "@/app/stores/editorStore";
import type { ComponentItem } from "@/app/stores/editorStore";

interface ButtonInspectorProps {
  component: ComponentItem;
  sectionId: string;
}

const ButtonInspector = ({ component, sectionId }: ButtonInspectorProps) => {
  const updateComponent = useEditorStore((s) => s.updateComponent);
  const { attributes, colors } = component;

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-xs">
        Label
        <input
          type="text"
          value={attributes?.label ?? ""}
          onChange={(e) =>
            updateComponent(sectionId, component.id, {
              attributes: { ...attributes, label: e.target.value },
            })
          }
          className="h-8 px-2 rounded border border-(--foreground)/10 bg-transparent text-sm"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs">
        Link (href)
        <input
          type="text"
          value={attributes?.href ?? ""}
          onChange={(e) =>
            updateComponent(sectionId, component.id, {
              attributes: { ...attributes, href: e.target.value },
            })
          }
          className="h-8 px-2 rounded border border-(--foreground)/10 bg-transparent text-sm"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs">
        Open in
        <select
          value={attributes?.target ?? "_self"}
          onChange={(e) =>
            updateComponent(sectionId, component.id, {
              attributes: { ...attributes, target: e.target.value },
            })
          }
          className="h-8 px-2 rounded border border-(--foreground)/10 bg-transparent text-sm"
        >
          <option value="_self">Same tab</option>
          <option value="_blank">New tab</option>
        </select>
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
        Border radius (px)
        <input
          type="number"
          min={0}
          value={attributes?.borderRadius ?? 6}
          onChange={(e) =>
            updateComponent(sectionId, component.id, {
              attributes: { ...attributes, borderRadius: Number(e.target.value) },
            })
          }
          className="h-8 px-2 rounded border border-(--foreground)/10 bg-transparent text-sm"
        />
      </label>

      <div className="flex gap-2">
        <label className="flex flex-col gap-1 text-xs flex-1">
          Padding X (px)
          <input
            type="number"
            min={0}
            value={attributes?.paddingX ?? 16}
            onChange={(e) =>
              updateComponent(sectionId, component.id, {
                attributes: { ...attributes, paddingX: Number(e.target.value) },
              })
            }
            className="h-8 px-2 rounded border border-(--foreground)/10 bg-transparent text-sm"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs flex-1">
          Padding Y (px)
          <input
            type="number"
            min={0}
            value={attributes?.paddingY ?? 8}
            onChange={(e) =>
              updateComponent(sectionId, component.id, {
                attributes: { ...attributes, paddingY: Number(e.target.value) },
              })
            }
            className="h-8 px-2 rounded border border-(--foreground)/10 bg-transparent text-sm"
          />
        </label>
      </div>

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
        Background color
        <input
          type="color"
          value={colors?.background ?? "#000000"}
          onChange={(e) =>
            updateComponent(sectionId, component.id, {
              colors: { ...colors, background: e.target.value },
            })
          }
          className="h-8 w-full cursor-pointer rounded border border-(--foreground)/10"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs">
        Text color
        <input
          type="color"
          value={colors?.text ?? "#ffffff"}
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

export default ButtonInspector;
