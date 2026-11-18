"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { deleteMenuItemAction, deleteMenuAction, reorderMenuItemsAction } from "@/lib/actions/menu-actions";
import { AddMenuItemForm } from "@/components/admin/add-menu-item-form";

interface MenuItemData {
  id: string;
  label: string;
  type: string;
  order: number;
  children?: MenuItemData[];
}

interface MenuData {
  id: string;
  name: string;
  slug: string;
  items: MenuItemData[];
}

export function MenuBuilder({
  menu,
  categoryOptions,
  pageOptions,
}: {
  menu: MenuData;
  categoryOptions: { id: string; name: string }[];
  pageOptions: { id: string; title: string }[];
}) {
  const [items, setItems] = useState(menu.items);
  const [, startTransition] = useTransition();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems((current) => {
      const oldIndex = current.findIndex((i) => i.id === active.id);
      const newIndex = current.findIndex((i) => i.id === over.id);
      const reordered = arrayMove(current, oldIndex, newIndex);

      startTransition(() => {
        reorderMenuItemsAction(reordered.map((i) => i.id));
      });

      return reordered;
    });
  }

  function handleDeleteMenu() {
    if (!confirm(`Supprimer le menu « ${menu.name} » et tous ses éléments ?`)) return;
    startTransition(() => deleteMenuAction(menu.id));
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-heading text-base font-bold text-foreground">{menu.name}</h3>
          <p className="text-xs text-muted-foreground">/{menu.slug}</p>
        </div>
        <button onClick={handleDeleteMenu} className="text-xs text-destructive hover:underline">
          Supprimer le menu
        </button>
      </div>

      {items.length === 0 ? (
        <p className="mb-3 text-sm text-muted-foreground">Aucun élément. Ajoutez-en un ci-dessous.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <ul className="mb-3 space-y-1.5">
              {items.map((item) => (
                <SortableMenuItem key={item.id} item={item} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      <AddMenuItemForm menuId={menu.id} categoryOptions={categoryOptions} pageOptions={pageOptions} />
    </div>
  );
}

function SortableMenuItem({ item }: { item: MenuItemData }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  function handleDelete() {
    if (!confirm(`Retirer « ${item.label} » du menu ?`)) return;
    deleteMenuItemAction(item.id);
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2"
    >
      <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground active:cursor-grabbing">
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex-1 text-sm text-foreground">{item.label}</span>
      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
        {item.type}
      </span>
      <button onClick={handleDelete} className="text-muted-foreground hover:text-destructive">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}
