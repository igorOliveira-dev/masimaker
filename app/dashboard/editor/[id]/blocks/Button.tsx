import type { ComponentItem } from "@/app/stores/editorStore";

interface ButtonProps {
  component: ComponentItem;
}

const Button = ({ component }: ButtonProps) => {
  const { attributes, colors } = component;

  return (
    <div style={{ textAlign: attributes?.align ?? "left" }}>
      <a
        href={attributes?.href ?? "#"}
        target={attributes?.target ?? "_self"}
        rel={attributes?.target === "_blank" ? "noopener noreferrer" : undefined}
        style={{
          display: "inline-block",
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
