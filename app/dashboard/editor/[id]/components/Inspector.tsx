"use client";

import { faAnglesRight, faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useEditorStore } from "@/app/stores/editorStore";
import { componentRegistry } from "../blocks";
import ConfirmModal from "@/app/dashboard/components/ConfirmModal";

const Inspector = () => {
  const sections = useEditorStore((s) => s.sections);
  const selectedSectionId = useEditorStore((s) => s.selectedSectionId);
  const selectedComponentId = useEditorStore((s) => s.selectedComponentId);
  const updateSection = useEditorStore((s) => s.updateSection);
  const removeSection = useEditorStore((s) => s.removeSection);
  const removeComponent = useEditorStore((s) => s.removeComponent);
  const selectSection = useEditorStore((s) => s.selectSection);

  const [showSideBar, setShowSidebar] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState<
    { type: "section"; sectionId: string } | { type: "component"; sectionId: string; componentId: string } | null
  >(null);

  const section = sections.find((s) => s.id === selectedSectionId);
  const component = section?.components.find((c) => c.id === selectedComponentId);
  const componentDef = component ? componentRegistry[component.type as keyof typeof componentRegistry] : undefined;

  useEffect(() => {
    setShowSidebar(true);
  }, [section, component]);

  return (
    <>
      <div
        onClick={() => (showSideBar === false ? setShowSidebar(true) : null)}
        className={`bg-[var(--background-secondary)] w-72 h-[calc(100%-20px)] border-l-2 border-[var(--foreground)]/10 shrink-0 ${
          showSideBar ? "" : "transform-[translateX(262px)]"
        } transition-transform`}
      >
        <div className="bg-[var(--foreground)]/10 p-1 flex justify-start">
          <FontAwesomeIcon
            icon={faAnglesRight}
            className={`text-[var(--foreground)]/80 font-thin text-xs cursor-pointer transition-transform ${
              showSideBar ? "" : "rotate-180"
            }`}
            onClick={() => setShowSidebar(!showSideBar)}
          />
        </div>

        {!showSideBar && (
          <div className="relative h-full">
            <button className="absolute text-sm right-full top-1/2 -rotate-90 origin-top-right whitespace-nowrap cursor-pointer pt-0.5 text-sm">
              Inspector
            </button>
          </div>
        )}

        {showSideBar && (
          <div className="flex flex-col h-[calc(100%-20px)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {!section && (
              <p className="px-3 pt-4 text-xs text-[var(--foreground)]/40">Select a section or a component to edit.</p>
            )}

            {section && !component && (
              <div className="flex flex-col gap-4 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm">section</p>
                  <button
                    onClick={() =>
                      setDeleteTarget({
                        type: "section",
                        sectionId: section.id,
                      })
                    }
                    className="cursor-pointer text-xs text-red-500 hover:opacity-70 transition-opacity"
                  >
                    Delete
                  </button>
                </div>

                <label className="flex flex-col gap-1 text-xs">
                  Background color
                  <input
                    type="color"
                    value={section.background ?? "#ffffff"}
                    onChange={(e) => updateSection(section.id, { background: e.target.value })}
                    className="h-8 w-full cursor-pointer rounded border border-[var(--foreground)]/10"
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs">
                  Height (px)
                  <input
                    type="number"
                    min={0}
                    value={section.height ?? 300}
                    onChange={(e) =>
                      updateSection(section.id, {
                        height: Number(e.target.value),
                      })
                    }
                    className="h-8 px-2 rounded border border-[var(--foreground)]/10 bg-transparent text-sm"
                  />
                </label>
              </div>
            )}

            {section && component && (
              <div className="flex flex-col gap-4 p-3">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => selectSection(section.id)}
                    className="cursor-pointer flex items-center gap-1 text-xs text-[var(--foreground)]/60 hover:opacity-70 transition-opacity"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} /> Section
                  </button>
                  <button
                    onClick={() =>
                      setDeleteTarget({
                        type: "component",
                        sectionId: section.id,
                        componentId: component.id,
                      })
                    }
                    className="cursor-pointer text-xs text-red-500 hover:opacity-70 transition-opacity"
                  >
                    Delete
                  </button>
                </div>

                <p className="text-sm">{componentDef?.label ?? component.type}</p>

                {componentDef?.Inspector ? (
                  <componentDef.Inspector component={component} sectionId={section.id} />
                ) : (
                  <p className="text-xs text-[var(--foreground)]/40">Esse component ainda não tem opções de edição.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title={deleteTarget?.type === "section" ? "Delete section" : "Delete component"}
        description="This action cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (!deleteTarget) return;

          if (deleteTarget.type === "section") {
            removeSection(deleteTarget.sectionId);
          } else {
            removeComponent(deleteTarget.sectionId, deleteTarget.componentId);
          }
        }}
      />
    </>
  );
};

export default Inspector;
