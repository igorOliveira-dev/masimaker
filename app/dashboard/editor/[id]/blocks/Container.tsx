import type { ComponentItem } from "@/app/stores/editorStore";

interface ContainerProps {
  component: ComponentItem;
  children?: React.ReactNode;
}

const Container = ({ component, children }: ContainerProps) => {
  const { attributes, colors } = component;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: attributes?.direction ?? "column",
        gap: attributes?.gap ?? 8,
        alignItems: attributes?.align ?? "stretch",
        justifyContent: attributes?.justify ?? "start",
        padding: attributes?.padding ?? 16,
        borderRadius: attributes?.borderRadius ?? 0,
        // altura explícita do canvas (redimensionada no preview) tem prioridade sobre
        // minHeight, que fica só como piso pra quando ainda não foi redimensionado
        height: component.height != null ? "100%" : undefined,
        minHeight: attributes?.minHeight ?? 60,
        boxSizing: "border-box",
        backgroundColor: colors?.background ?? "transparent",
      }}
    >
      {children}
    </div>
  );
};

export default Container;
