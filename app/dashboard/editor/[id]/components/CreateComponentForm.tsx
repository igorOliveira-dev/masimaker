"use client";

import { useState } from "react";

type ComponentType = "title" | "paragraph" | "image" | "button";

interface CreateComponentFormProps {
  onSubmit: (data: { type: ComponentType; attributes: Record<string, any> }) => Promise<void>;
  onCancel: () => void;
}

const TYPE_LABELS: Record<ComponentType, string> = {
  title: "Title",
  paragraph: "Paragraph",
  image: "Image",
  button: "Button",
};

export default function CreateComponentForm({ onSubmit, onCancel }: CreateComponentFormProps) {
  const [type, setType] = useState<ComponentType>("title");
  const [text, setText] = useState("");
  const [src, setSrc] = useState("");
  const [alt, setAlt] = useState("");
  const [label, setLabel] = useState("");
  const [href, setHref] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function buildAttributes(): Record<string, any> {
    switch (type) {
      case "title":
      case "paragraph":
        return { text };
      case "image":
        return { src, alt };
      case "button":
        return { label, href };
    }
  }

  function isValid() {
    switch (type) {
      case "title":
      case "paragraph":
        return text.trim().length > 0;
      case "image":
        return src.trim().length > 0;
      case "button":
        return label.trim().length > 0;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isValid()) {
      setError("Fill in the required fields.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ type, attributes: buildAttributes() });
    } catch {
      setError("Unable to create the component. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Component type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as ComponentType)}
          className="bg-[var(--background-secondary)] border border-[var(--foreground)]/20 rounded-md px-3 py-2 outline-none"
        >
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {(type === "title" || type === "paragraph") && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Text</label>
          {type === "paragraph" ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="bg-[var(--background-secondary)] border border-[var(--foreground)]/20 rounded-md px-3 py-2 outline-none resize-none"
            />
          ) : (
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="bg-[var(--background-secondary)] border border-[var(--foreground)]/20 rounded-md px-3 py-2 outline-none"
            />
          )}
        </div>
      )}

      {type === "image" && (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Image URL</label>
            <input
              type="text"
              value={src}
              onChange={(e) => setSrc(e.target.value)}
              placeholder="https://..."
              className="bg-[var(--background-secondary)] border border-[var(--foreground)]/20 rounded-md px-3 py-2 outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Alt text</label>
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              className="bg-[var(--background-secondary)] border border-[var(--foreground)]/20 rounded-md px-3 py-2 outline-none"
            />
          </div>
        </>
      )}

      {type === "button" && (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Button text</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="bg-[var(--background-secondary)] border border-[var(--foreground)]/20 rounded-md px-3 py-2 outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Link (URL)</label>
            <input
              type="text"
              value={href}
              onChange={(e) => setHref(e.target.value)}
              placeholder="https://..."
              className="bg-[var(--background-secondary)] border border-[var(--foreground)]/20 rounded-md px-3 py-2 outline-none"
            />
          </div>
        </>
      )}

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
          {loading ? "Adding..." : "Add component"}
        </button>
      </div>
    </form>
  );
}
