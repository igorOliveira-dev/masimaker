// Este componente mostra a estrutura da página em forma de árvore com sections e components.

"use client";

import { ChevronDown, ChevronRight, LayoutPanelTop, Plus, GripVertical } from "lucide-react";
import { useRef, useState } from "react";
import { Check, Pencil } from "lucide-react";
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
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [draftSectionName, setDraftSectionName] = useState("");
  const [draggedComponentId, setDraggedComponentId] = useState<string | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const draggedComponentIdRef = useRef<string | null>(null);
  const dropTargetIndexRef = useRef<number | null>(null);

  // Alterna a visibilidade dos componentes internos de uma section na árvore.
  function toggleCollapse(sectionId: string) {
    setCollapsed((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }

  function getComponentLabel(component: (typeof sections)[number]["components"][number], fallbackLabel: string) {
    if (component.type !== "text") {
      return fallbackLabel;
    }

    const rawContent = typeof component.attributes?.content === "string" ? component.attributes.content.trim() : "";

    if (!rawContent) {
      return fallbackLabel;
    }

    const compactLabel = rawContent.replace(/\s+/g, " ");

    if (compactLabel.length > 18) {
      const firstWord = compactLabel.split(" ")[0] ?? compactLabel;
      return `${firstWord}..`;
    }

    return compactLabel;
  }

  function getSectionLabel(section: (typeof sections)[number], sectionIndex: number) {
    if (section.name?.trim()) {
      return section.name.trim();
    }

    return `Section ${sectionIndex + 1}`;
  }

  function commitSectionRename(sectionId: string) {
    const trimmedName = draftSectionName.trim();
    updateSection(sectionId, { name: trimmedName || null });
    setEditingSectionId(null);
    setDraftSectionName("");
  }

  function moveComponent(sectionId: string, fromComponentId: string, targetIndex: number | null) {
    const latestSection = useEditorStore.getState().sections.find((item) => item.id === sectionId);
    if (!latestSection) return;

    const currentComponents = [...latestSection.components];
    const fromIndex = currentComponents.findIndex((component) => component.id === fromComponentId);

    if (fromIndex === -1) return;

    const [movedComponent] = currentComponents.splice(fromIndex, 1);

    if (targetIndex === null) {
      currentComponents.push(movedComponent);
    } else {
      if (targetIndex === fromIndex) {
        currentComponents.splice(fromIndex, 0, movedComponent);
      } else {
        const insertIndex = targetIndex > fromIndex ? targetIndex - 1 : targetIndex;
        currentComponents.splice(insertIndex, 0, movedComponent);
      }
    }

    const reorderedComponents = currentComponents.map((component, index) => ({
      ...component,
      position: index,
    }));

    updateSection(sectionId, { components: reorderedComponents } as never);
  }

  function resetDragState() {
    setDraggedComponentId(null);
    draggedComponentIdRef.current = null;
    dropTargetIndexRef.current = null;
    setDropTargetIndex(null);
  }

  function handleComponentDrop(sectionId: string, draggedId: string | null, targetIndex: number | null) {
    const activeDraggedId = draggedId ?? draggedComponentIdRef.current;

    if (!activeDraggedId) {
      resetDragState();
      return;
    }

    setDropTargetIndex(targetIndex);
    moveComponent(sectionId, activeDraggedId, targetIndex);
    resetDragState();
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

                  {editingSectionId === section.id ? (
                    <input
                      autoFocus
                      value={draftSectionName}
                      onChange={(e) => setDraftSectionName(e.target.value)}
                      onBlur={() => commitSectionRename(section.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          commitSectionRename(section.id);
                        }
                      }}
                      className="flex-1 min-w-0 bg-transparent text-sm outline-none border-b border-[var(--foreground)]/30"
                      placeholder={getSectionLabel(section, sectionIndex)}
                    />
                  ) : (
                    <span className="text-sm truncate flex-1">
                      {getSectionLabel(section, sectionIndex)}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (editingSectionId === section.id) {
                        commitSectionRename(section.id);
                        return;
                      }

                      setEditingSectionId(section.id);
                      setDraftSectionName(section.name?.trim() ?? "");
                    }}
                    className="cursor-pointer flex items-center justify-center w-6 h-6 rounded hover:bg-[var(--foreground)]/10 shrink-0"
                    aria-label="Rename section"
                  >
                    {editingSectionId === section.id ? <Check size={13} /> : <Pencil size={13} />}
                  </button>

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
                      <>
                        {section.components.map((component, index) => {
                          const def =
                            componentRegistry[
                              component.type as keyof typeof componentRegistry
                            ];
                          const isSelected = selectedComponentId === component.id;
                          const isDragging = draggedComponentId === component.id;
                          const isDropTarget = dropTargetIndex === index;

                          return (
                            <div key={component.id} className="flex flex-col">
                              {isDropTarget && (
                                <div className="flex items-center gap-2 my-1 rounded border border-[var(--purple)]/40 bg-[var(--purple)]/10 px-2 py-1">
                                  <div className="h-2 w-2 rounded-full bg-[var(--purple)]" />
                                  <span className="text-[10px] uppercase tracking-wide text-[var(--purple)]">
                                    Will be placed here
                                  </span>
                                </div>
                              )}
                              <div
                                draggable
                                onDragStart={(e) => {
                                  e.stopPropagation();
                                  draggedComponentIdRef.current = component.id;
                                  setDraggedComponentId(component.id);
                                  e.dataTransfer.effectAllowed = "move";
                                  e.dataTransfer.setData("text/plain", component.id);
                                }}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  e.dataTransfer.dropEffect = "move";
                                }}
                                onDragEnter={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const activeDraggedId = draggedComponentIdRef.current ?? draggedComponentId;
                                  if (activeDraggedId === component.id) {
                                    if (dropTargetIndexRef.current !== null) {
                                      dropTargetIndexRef.current = null;
                                    }
                                    return;
                                  }

                                  if (dropTargetIndexRef.current !== index) {
                                    dropTargetIndexRef.current = index;
                                  }
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const droppedId = e.dataTransfer.getData("text/plain") || draggedComponentIdRef.current;
                                  handleComponentDrop(section.id, droppedId || null, dropTargetIndexRef.current);
                                }}
                                onDragEnd={() => {
                                  resetDragState();
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  selectComponent(section.id, component.id);
                                }}
                                className={`group flex items-center gap-2 h-7 px-1 rounded cursor-pointer transition-colors ${
                                  isSelected
                                    ? "bg-[var(--foreground)]/15"
                                    : "hover:bg-[var(--foreground)]/10"
                                } ${isDragging ? "opacity-50" : ""}`}
                              >
                                <GripVertical size={13} className="shrink-0 opacity-40" />
                                {def?.icon ? (
                                  <def.icon
                                    size={13}
                                    className="shrink-0 opacity-70"
                                  />
                                ) : null}
                                <span className="text-xs truncate flex-1">
                                  {getComponentLabel(component, def?.label ?? component.type)}
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
                            </div>
                          );
                        })}
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.dataTransfer.dropEffect = "move";
                          }}
                          onDragEnter={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (draggedComponentIdRef.current || draggedComponentId) {
                              if (dropTargetIndexRef.current !== section.components.length) {
                                dropTargetIndexRef.current = section.components.length;
                              }
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const droppedId = e.dataTransfer.getData("text/plain") || draggedComponentIdRef.current;
                            handleComponentDrop(section.id, droppedId || null, dropTargetIndexRef.current);
                          }}
                          className={`mt-1 rounded border border-dashed px-2 py-1 ${
                            dropTargetIndex === section.components.length
                              ? "border-[var(--purple)]/50 bg-[var(--purple)]/10"
                              : "border-[var(--foreground)]/15"
                          }`}
                        >
                          {dropTargetIndex === section.components.length ? (
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-[var(--purple)]" />
                              <span className="text-[10px] uppercase tracking-wide text-[var(--purple)]">
                                Will be placed at the end
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </>
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
