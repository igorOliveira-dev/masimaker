// Este componente alterna entre os tamanhos de viewport usados na pré-visualização.

"use client";

import { Smartphone, Tablet, Monitor } from "lucide-react";
import { useEditorStore, type PreviewDevice } from "@/app/stores/editorStore";

const options: {
  value: PreviewDevice;
  icon: React.ElementType;
  label: string;
}[] = [
  { value: "mobile", icon: Smartphone, label: "Celular" },
  { value: "tablet", icon: Tablet, label: "Tablet" },
  { value: "desktop", icon: Monitor, label: "Computador" },
];

// Exibe os botões para alternar o tamanho do viewport da pré-visualização.
export default function PreviewDeviceToggle() {
  const previewDevice = useEditorStore((s) => s.previewDevice);
  const setPreviewDevice = useEditorStore((s) => s.setPreviewDevice);

  return (
    <div className="flex items-center gap-1 rounded-lg border border-[var(--foreground)]/10 p-1">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          title={label}
          onClick={() => setPreviewDevice(value)}
          className={`cursor-pointer p-1.5 rounded-md transition-colors ${
            previewDevice === value
              ? "bg-[var(--purple)] text-white"
              : "hover:bg-[var(--foreground)]/10 text-[var(--foreground)]/70"
          }`}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}
