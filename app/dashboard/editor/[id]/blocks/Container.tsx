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
        minHeight: attributes?.minHeight ?? 60,
        backgroundColor: colors?.background ?? "transparent",
      }}
    >
      {children}
    </div>
  );
};

export default Container;
