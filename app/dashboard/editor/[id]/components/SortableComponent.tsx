import { useSortable } from '@dnd-kit/react/sortable';

type Props = {
  id: string;
  index: number;
  label: string;
  sectionId: string;
};

export function SortableComponent({ id, index, label, sectionId }: Props) {
  const { ref, isDragging } = useSortable({
    id,
    index,
    group: sectionId,
    type: 'component',
    accept: 'component',
  });

  return (
    <div
      ref={ref}
      className={`cursor-grab rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-sm ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {label}
    </div>
  );
}