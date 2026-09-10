"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { useEditorStore } from "@/app/stores/editorStore";
import type { ComponentItem } from "@/app/stores/editorStore";
import { createClient } from "@/app/utils/supabase/client";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface ImageInspectorProps {
  component: ComponentItem;
  sectionId: string;
}

const ImageInspector = ({ component, sectionId }: ImageInspectorProps) => {
  const updateComponent = useEditorStore((s) => s.updateComponent);
  const { attributes } = component;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow selecting the same file again later
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("Image must be smaller than 5MB.");
      return;
    }

    setUploading(true);
    setUploadError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const extension = file.name.split(".").pop() || "png";
    const path = `${user?.id ?? "anonymous"}/${crypto.randomUUID()}.${extension}`;

    // "images" bucket must exist and be public in Supabase Storage
    const { error: uploadErr } = await supabase.storage.from("images").upload(path, file);

    if (uploadErr) {
      setUploadError("Could not upload the image. Please try again.");
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(path);

    updateComponent(sectionId, component.id, {
      attributes: { ...attributes, src: publicUrl },
    });
    setUploading(false);
  }

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

      <div className="flex flex-col gap-1 text-xs">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="h-8 px-2 rounded border border-(--foreground)/10 bg-transparent text-sm flex items-center justify-center gap-1.5 cursor-pointer hover:bg-(--foreground)/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload size={14} />
          {uploading ? "Uploading..." : "Upload from computer"}
        </button>
        {uploadError && <span className="text-red-600">{uploadError}</span>}
      </div>

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
            className="h-8 w-25 px-2 rounded border border-(--foreground)/10 bg-transparent text-sm"
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
            className="h-8 w-25 px-2 rounded border border-(--foreground)/10 bg-transparent text-sm"
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
