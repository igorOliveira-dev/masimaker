import type { ComponentItem } from "@/app/stores/editorStore";

interface ButtonProps {
  component: ComponentItem;
}

const ALIGN_TO_JUSTIFY: Record<string, string> = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
};

const Button = ({ component }: ButtonProps) => {
  const { attributes, colors, width, height } = component;
  // quando o component tem width/height explícitos (redimensionado no canvas), o link
  // preenche a caixa toda e o label fica alinhado dentro dela; sem redimensionar,
  // continua com o tamanho natural do conteúdo (inline-block), como sempre foi
  const filled = width != null || height != null;

  return (
    <div style={{ textAlign: attributes?.align ?? "left", width: filled ? "100%" : undefined, height: filled ? "100%" : undefined }}>
      <a
        href={attributes?.href ?? "#"}
        target={attributes?.target ?? "_self"}
        rel={attributes?.target === "_blank" ? "noopener noreferrer" : undefined}
        style={{
          display: filled ? "flex" : "inline-block",
          alignItems: "center",
          justifyContent: ALIGN_TO_JUSTIFY[attributes?.align ?? "left"],
          boxSizing: "border-box",
          width: filled ? "100%" : undefined,
          height: filled ? "100%" : undefined,
          cursor: "pointer",
          backgroundColor: colors?.background ?? "#000000",
          color: colors?.text ?? "#ffffff",
          fontSize: attributes?.fontSize ?? 16,
          borderRadius: attributes?.borderRadius ?? 6,
          padding: `${attributes?.paddingY ?? 8}px ${attributes?.paddingX ?? 16}px`,
        }}
      >
        {attributes?.label ?? "Click me"}
      </a>
    </div>
  );
};

export default Button;
