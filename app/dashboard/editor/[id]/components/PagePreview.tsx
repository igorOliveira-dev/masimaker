"use client";

import { Plus } from "lucide-react";
import { useEditorStore } from "@/app/stores/editorStore";
import { componentRegistry } from "../blocks";

const PagePreview = () => {
  const sections = useEditorStore((s) => s.sections);

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[var(--background)] p-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        {sections.map((section) => (
          <div
            key={section.id}
            className="w-full rounded-lg border-2 border-dashed border-[var(--foreground)]/10 p-4"
            style={{
              backgroundColor: section.background ?? undefined,
              minHeight: section.height ?? 80,
            }}
          >
            {section.components.length > 0
              ? section.components.map((component) => {
                  const def = componentRegistry[component.type as keyof typeof componentRegistry];
                  if (!def) return null;
                  const { Component } = def;
                  return <Component key={component.id} component={component} />;
                })
              : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PagePreview;
