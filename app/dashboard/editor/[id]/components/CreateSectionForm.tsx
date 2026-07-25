"use client";

import { useState } from "react";

interface CreateSectionFormProps {
  onSubmit: (data: { background: string; height: string }) => Promise<void>;
  onCancel: () => void;
}

export default function CreateSectionForm({ onSubmit, onCancel }: CreateSectionFormProps) {
  const [background, setBackground] = useState("#ffffff");
  const [height, setHeight] = useState("auto");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit({ background, height });
    } catch {
      setError("Could not create the section. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Background color</label>
        <input
          type="color"
          value={background}
          onChange={(e) => setBackground(e.target.value)}
          className="w-full h-10 rounded-md border border-[var(--foreground)]/20 bg-[var(--background-secondary)]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Height</label>
        <select
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          className="bg-[var(--background-secondary)] border border-[var(--foreground)]/20 rounded-md px-3 py-2 outline-none"
        >
          <option value="auto">Auto</option>
          <option value="50vh">Half screen</option>
          <option value="100vh">Full screen</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="cursor-pointer flex-1 bg-[var(--background-secondary)] hover:opacity-80 transition-opacity rounded-md px-4 py-2 font-medium disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer flex-1 bg-[var(--purple)] hover:opacity-80 transition-opacity text-white rounded-md px-4 py-2 font-medium disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create section"}
        </button>
      </div>
    </form>
  );
}
