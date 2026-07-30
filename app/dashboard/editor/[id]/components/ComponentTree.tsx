"use client";

import { ChevronDown, ChevronRight, LayoutPanelTop, Plus } from "lucide-react";
import { useState } from "react";
import { useEditorStore } from "@/app/stores/editorStore";
import { componentRegistry } from "../blocks";
import ActionsMenu from "../../../components/ActionsMenu";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";

const ComponentTree = () => {
  const sections = useEditorStore((s) => s.sections);
  const selectedSectionId = useEditorStore((s) => s.selectedSectionId);
  const selectedComponentId = useEditorStore((s) => s.selectedComponentId);
  const addSection = useEditorStore((s) => s.addSection);
  const updateSection = useEditorStore((s) => s.updateSection);
  const selectSection = useEditorStore((s) => s.selectSection);
  const selectComponent = useEditorStore((s) => s.selectComponent);
  const removeSection = useEditorStore((s) => s.removeSection);
  const removeComponent = useEditorStore((s) => s.removeComponent);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  function toggleCollapse(sectionId: string) {
    setCollapsed((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }

  return (
    <>
      {sections.length === 0 ? (
        <div className="flex flex-col">
          <p className="px-2 text-sm">Structure</p>
          <p className="text-xs text-[var(--foreground)]/40 px-2 py-3">
            No sections yet.
          </p>
          <button
            onClick={() => addSection()}
            className="cursor-pointer p-2 flex gap-2 items-center justify-center text-sm bg-[var(--foreground)]/10 mx-2 rounded hover:opacity-80 transition-opacity"
          >
            <Plus size={18} />
            <span>Create first section</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-1 px-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm">Structure</p>
            <button
              onClick={() => addSection()}
              className="cursor-pointer flex px-2 py-0.5 gap-2 items-center justify-center text-sm bg-[var(--foreground)]/10 mx-2 rounded hover:opacity-80 transition-opacity"
            >
              + section
            </button>
          </div>
          {sections.map((section, sectionIndex) => {
            const isOpen = !collapsed[section.id];
            const isSectionSelected =
              selectedSectionId === section.id && !selectedComponentId;

            return (
              <div key={section.id} className="flex flex-col">
                <div
                  className={`group flex items-center gap-1 h-8 px-1 rounded cursor-pointer transition-colors ${
                    isSectionSelected
                      ? "bg-[var(--foreground)]/15"
                      : "hover:bg-[var(--foreground)]/10"
                  }`}
                  onClick={() => selectSection(section.id)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCollapse(section.id);
                    }}
                    className="cursor-pointer flex items-center justify-center w-4 h-4 shrink-0"
                  >
                    {isOpen ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </button>

                  <LayoutPanelTop size={14} className="shrink-0 opacity-70" />

                  <span className="text-sm truncate flex-1">
                    Section {sectionIndex + 1}
                  </span>

                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    <ActionsMenu
                      options={[
                        {
                          label: "Edit",
                          icon: faPen,
                          onClick: () => selectSection(section.id),
                        },
                        {
                          label: "Delete",
                          icon: faTrash,
                          danger: true,
                          onClick: () => removeSection(section.id),
                        },
                      ]}
                    />
                  </div>
                </div>

                {isOpen && (
                  <div className="flex flex-col ml-6 border-l border-[var(--foreground)]/10 pl-2">
                    {section.components.length === 0 ? (
                      <p className="text-xs text-[var(--foreground)]/30 py-1">
                        Empty
                      </p>
                    ) : (
                      section.components.map((component) => {
                        const def =
                          componentRegistry[
                            component.type as keyof typeof componentRegistry
                          ];
                        const isSelected = selectedComponentId === component.id;

                        return (
                          <div
                            key={component.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              selectComponent(section.id, component.id);
                            }}
                            className={`group flex items-center gap-2 h-7 px-1 rounded cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-[var(--foreground)]/15"
                                : "hover:bg-[var(--foreground)]/10"
                            }`}
                          >
                            {def?.icon ? (
                              <def.icon
                                size={13}
                                className="shrink-0 opacity-70"
                              />
                            ) : null}
                            <span className="text-xs truncate flex-1">
                              {def?.label ?? component.type}
                            </span>
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            >
                              <ActionsMenu
                                options={[
                                  {
                                    label: "Edit",
                                    icon: faPen,
                                    onClick: () =>
                                      selectComponent(section.id, component.id),
                                  },
                                  {
                                    label: "Delete",
                                    icon: faTrash,
                                    danger: true,
                                    onClick: () =>
                                      removeComponent(section.id, component.id),
                                  },
                                ]}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default ComponentTree;
