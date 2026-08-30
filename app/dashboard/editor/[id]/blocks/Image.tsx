import { ImageOff } from "lucide-react";
import type { ComponentItem } from "@/app/stores/editorStore";

// inputs de largura/altura são texto livre ("100%", "auto", "320px", "320");
// um número puro sem unidade é CSS inválido (React só adiciona "px" sozinho
// quando o valor é number, não string) e o navegador simplesmente ignora o valor
function toCssLength(value: unknown, fallback: string): string {
  if (value === undefined || value === null || value === "") return fallback;
  const str = String(value);
  return /^-?\d+(\.\d+)?$/.test(str) ? `${str}px` : str;
}

interface ImageProps {
  component: ComponentItem;
}

const Image = ({ component }: ImageProps) => {
  const { attributes } = component;
  const src = attributes?.src ?? "";
  const width = toCssLength(attributes?.width, "100%");
  const height = toCssLength(attributes?.height, "auto");

  return (
    <div style={{ textAlign: attributes?.align ?? "left" }}>
      {src ? (
        <img
          src={src}
          alt={attributes?.alt ?? ""}
          style={{
            width,
            height,
            objectFit: attributes?.objectFit ?? "cover",
            borderRadius: attributes?.borderRadius ?? 0,
            display: "inline-block",
          }}
        />
      ) : (
        <div
          className="inline-flex flex-col items-center justify-center gap-1 border border-dashed border-(--foreground)/20 text-(--foreground)/40 text-xs"
          style={{
            width,
            height: height === "auto" ? 120 : height,
            borderRadius: attributes?.borderRadius ?? 0,
          }}
        >
          <ImageOff size={20} />
          No image
        </div>
      )}
    </div>
  );
};

export default Image;
