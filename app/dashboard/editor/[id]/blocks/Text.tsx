import type { ComponentItem } from "@/app/stores/editorStore";

interface TextProps {
  component: ComponentItem;
}

const Text = ({ component }: TextProps) => {
  const { attributes, colors } = component;

  return (
    <p
      style={{
        color: colors?.text ?? "inherit",
        fontSize: attributes?.fontSize ?? 16,
        fontWeight: attributes?.fontWeight ?? "normal",
        textAlign: attributes?.align ?? "left",
      }}
    >
      {attributes?.content ?? "Exemple text"}
    </p>
  );
};

export default Text;
