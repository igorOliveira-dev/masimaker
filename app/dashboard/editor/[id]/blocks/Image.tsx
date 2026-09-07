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
  // quando redimensionado no canvas (component.width/height explícitos), a imagem
  // preenche a caixa toda (100% x 100%) e o objectFit cuida do enquadramento - sem
  // isso, height:"auto" (o padrão) ignora a altura da caixa redimensionada e mantém
  // a proporção natural da imagem, que pode ultrapassar esse limite
  const filled = component.width != null || component.height != null;
  const width = filled ? "100%" : toCssLength(attributes?.width, "100%");
  const height = filled ? "100%" : toCssLength(attributes?.height, "auto");

  return (
    <div
      style={{
        textAlign: attributes?.align ?? "left",
        width: filled ? "100%" : undefined,
        height: filled ? "100%" : undefined,
      }}
    >
      {src ? (
        <img
          src={src}
          alt={attributes?.alt ?? ""}
          style={{
            width,
            height,
            objectFit: attributes?.objectFit ?? "cover",
            borderRadius: attributes?.borderRadius ?? 0,
            display: filled ? "block" : "inline-block",
          }}
        />
      ) : (
        <div
          className="inline-flex flex-col items-center justify-center gap-1 border border-dashed border-black/20 text-black/40 text-md"
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
