import { useState } from "react";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";
import { useCloudState } from "@/hooks/useCloudState";

export function EditableList({
  storageKey,
  initial,
  placeholder = "Adicionar item",
  checkable = false,
}: {
  storageKey: string;
  initial: string[];
  placeholder?: string;
  checkable?: boolean;
}) {
  const [items, setItems] = useCloudState<string[]>(storageKey, initial);
  const [done, setDone] = useCloudState<string[]>(`${storageKey}.done`, []);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [newItem, setNewItem] = useState("");

  const startEdit = (i: number) => {
    setEditingIdx(i);
    setDraft(items[i]);
  };
  const saveEdit = () => {
    if (editingIdx === null) return;
    const next = [...items];
    next[editingIdx] = draft.trim() || items[editingIdx];
    setItems(next);
    setEditingIdx(null);
  };
  const remove = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const toggle = (text: string) =>
    setDone(done.includes(text) ? done.filter((d) => d !== text) : [...done, text]);
  const add = () => {
    const t = newItem.trim();
    if (!t) return;
    setItems([...items, t]);
    setNewItem("");
  };

  return (
    <div className="space-y-2">
      {checkable && items.length > 0 && (
        <div className="flex items-center justify-between text-[10px] tracking-[0.3em] uppercase text-silver/70 mb-1">
          <span>Progresso</span>
          <span className="text-gold">
            {items.filter((i) => done.includes(i)).length}/{items.length}
          </span>
        </div>
      )}
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li
            key={i}
            className={`group flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition ${
              checkable && done.includes(it)
                ? "border-wine/40 bg-wine/10"
                : "border-[oklch(0.85_0.008_250/0.12)] bg-black/30"
            }`}
          >
            {editingIdx === i ? (
              <>
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                  className="flex-1 bg-transparent outline-none border-b border-gold/40 pb-0.5"
                />
                <button onClick={saveEdit} className="text-gold hover:text-foreground">
                  <Check className="h-4 w-4" strokeWidth={1.5} />
                </button>
                <button onClick={() => setEditingIdx(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </>
            ) : (
              <>
                {checkable && (
                  <button
                    onClick={() => toggle(it)}
                    aria-label="Marcar concluído"
                    className={`h-4 w-4 shrink-0 rounded border flex items-center justify-center transition ${
                      done.includes(it)
                        ? "bg-darkred border-darkred"
                        : "border-silver/40 hover:border-gold"
                    }`}
                  >
                    {done.includes(it) && (
                      <Check className="h-3 w-3 text-silver" strokeWidth={2.5} />
                    )}
                  </button>
                )}
                <span
                  className={`flex-1 ${
                    checkable && done.includes(it)
                      ? "line-through text-silver/50"
                      : "text-foreground/85"
                  }`}
                >
                  {it}
                </span>
                <button
                  onClick={() => startEdit(i)}
                  className="opacity-60 group-hover:opacity-100 text-gold transition"
                  aria-label="Editar"
                >
                  <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => remove(i)}
                  className="opacity-60 group-hover:opacity-100 text-darkred transition"
                  aria-label="Remover"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
      <div className="flex gap-2 pt-1">
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder={placeholder}
          className="flex-1 rounded-md bg-black/40 border border-[oklch(0.85_0.008_250/0.2)] px-3 py-2 text-sm outline-none focus:border-gold"
        />
        <button
          onClick={add}
          className="rounded-md border border-gold/40 text-gold px-3 py-2 text-sm hover:bg-gold hover:text-primary-foreground transition flex items-center gap-1"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} /> Add
        </button>
      </div>
    </div>
  );
}