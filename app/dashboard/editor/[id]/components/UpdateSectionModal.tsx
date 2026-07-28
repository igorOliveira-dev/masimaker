"use client";

import { useState } from "react";

interface UpdateSectionModalProps {
  initialValues?: { background?: string; height?: number };
  onConfirm: (values: { background: string; height: number }) => void;
  onClose: () => void;
}

const UpdateSectionModal = ({ initialValues, onConfirm, onClose }: UpdateSectionModalProps) => {
  const [background, setBackground] = useState(initialValues?.background ?? "#ffffff");
  const [height, setHeight] = useState(initialValues?.height ?? 300);

  function handleConfirm() {
    onConfirm({ background, height });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-[var(--background)] rounded-lg p-4 w-72 flex flex-col gap-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-sm font-medium">Update section</h2>

        <label className="flex flex-col gap-1 text-xs">
          Background color
          <input
            type="color"
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            className="h-8 w-full cursor-pointer rounded border border-[var(--foreground)]/10"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs">
          Height (px)
          <input
            type="number"
            min={0}
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="h-8 px-2 rounded border border-[var(--foreground)]/10 bg-transparent text-sm"
          />
        </label>

        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={onClose}
            className="cursor-pointer px-3 py-1 text-xs rounded hover:bg-[var(--foreground)]/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="cursor-pointer px-3 py-1 text-xs rounded bg-[var(--foreground)]/10 hover:opacity-80 transition-opacity"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateSectionModal;
