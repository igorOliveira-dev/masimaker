// Este componente renderiza um bloco de texto dentro do preview do editor.

import type { ComponentItem } from "@/app/stores/editorStore";

interface TextProps {
  component: ComponentItem;
}

// Renderiza um bloco de texto com atributos e cores vindos do estado do editor.
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
