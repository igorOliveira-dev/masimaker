import { useSortable } from "@dnd-kit/react/sortable";
import { SortableComponent } from "./SortableComponent";

type ComponentItem = { id: string; type: string; label: string };
type Section = { id: string; name: string; components: ComponentItem[] };

type Props = {
    section: Section;
    index: number;
};

export function SortableSection({ section, index }: Props) {
    const { ref, isDragging } = useSortable({
        id: section.id,
        index,
        type: "section",
        accept: "section",
});

return (
    <div
        ref={ref}
        className={`rounded-xl border border-zinc-800 bg-zinc-950 p-4 ${
        isDragging ? "opacity-50" : ""
    }`}
    >
    <div className="mb-3 font-medium text-zinc-200">{section.name}</div>

    <div className="flex flex-col gap-2 pl-4">
        {section.components.map((component, cIndex) => (
        <SortableComponent
            key={component.id}
            id={component.id}
            index={cIndex}
            label={component.label}
            sectionId={section.id}
        />
        ))}
    </div>
    </div>
);
}
