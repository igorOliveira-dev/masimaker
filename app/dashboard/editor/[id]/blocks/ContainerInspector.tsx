"use client";

import { useEditorStore } from "@/app/stores/editorStore";
import type { ComponentItem } from "@/app/stores/editorStore";

interface ContainerInspectorProps {
  component: ComponentItem;
  sectionId: string;
}

const ContainerInspector = ({ component, sectionId }: ContainerInspectorProps) => {
  const updateComponent = useEditorStore((s) => s.updateComponent);
  const { attributes, colors } = component;

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-xs">
        Direction
        <select
          value={attributes?.direction ?? "column"}
          onChange={(e) =>
            updateComponent(sectionId, component.id, {
              attributes: { ...attributes, direction: e.target.value },
            })
          }
          className="h-8 px-2 rounded border border-(--foreground)/10 bg-transparent text-sm"
        >
          <option value="column">Column</option>
          <option value="row">Row</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs">
        Gap (px)
        <input
          type="number"
          min={0}
          value={attributes?.gap ?? 8}
          onChange={(e) =>
            updateComponent(sectionId, component.id, {
              attributes: { ...attributes, gap: Number(e.target.value) },
            })
          }
          className="h-8 px-2 rounded border border-(--foreground)/10 bg-transparent text-sm"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs">
        Align items
        <select
          value={attributes?.align ?? "stretch"}
          onChange={(e) =>
            updateComponent(sectionId, component.id, {
              attributes: { ...attributes, align: e.target.value },
            })
          }
          className="h-8 px-2 rounded border border-(--foreground)/10 bg-transparent text-sm"
        >
          <option value="stretch">Stretch</option>
          <option value="flex-start">Start</option>
          <option value="center">Center</option>
          <option value="flex-end">End</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs">
        Justify content
        <select
          value={attributes?.justify ?? "start"}
          onChange={(e) =>
            updateComponent(sectionId, component.id, {
              attributes: { ...attributes, justify: e.target.value },
            })
          }
          className="h-8 px-2 rounded border border-(--foreground)/10 bg-transparent text-sm"
        >
          <option value="start">Start</option>
          <option value="center">Center</option>
          <option value="end">End</option>
          <option value="space-between">Space between</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs">
        Padding (px)
        <input
          type="number"
          min={0}
          value={attributes?.padding ?? 16}
          onChange={(e) =>
            updateComponent(sectionId, component.id, {
              attributes: { ...attributes, padding: Number(e.target.value) },
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
        Min height (px)
        <input
          type="number"
          min={0}
          value={attributes?.minHeight ?? 60}
          onChange={(e) =>
            updateComponent(sectionId, component.id, {
              attributes: { ...attributes, minHeight: Number(e.target.value) },
            })
          }
          className="h-8 px-2 rounded border border-(--foreground)/10 bg-transparent text-sm"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs">
        Background color
        <input
          type="color"
          value={colors?.background && colors.background !== "transparent" ? colors.background : "#ffffff"}
          onChange={(e) =>
            updateComponent(sectionId, component.id, {
              colors: { ...colors, background: e.target.value },
            })
          }
          className="h-8 w-full cursor-pointer rounded border border-(--foreground)/10"
        />
      </label>
    </div>
  );
};

export default ContainerInspector;
