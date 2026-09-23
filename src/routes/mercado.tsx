import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useShopping } from "@/hooks/useShopping";
import { useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/mercado")({
  head: () => ({ meta: [{ title: "Mercado — Estudia" }] }),
  component: MercadoPage,
});

function MercadoPage() {
  const { items, isLoading, add, toggle, remove } = useShopping();
  const [name, setName] = useState("");
  const [qty, setQty] = useState("1");

  const submit = () => {
    if (!name.trim()) return;
    const q = Math.max(1, parseInt(qty, 10) || 1);
    add(name.trim(), q);
    setName("");
    setQty("1");
  };

  return (
    <AppShell title="Mercado" subtitle="Lista de compras">
      <section className="glass-card p-6 max-w-2xl">
        <div className="flex flex-col sm:flex-row gap-2 mb-5">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Item"
            className="flex-1 rounded-md bg-black/40 border border-[oklch(0.85_0.008_250/0.2)] px-3 py-2 text-sm outline-none focus:border-gold"
          />
          <input
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Qtd"
            className="sm:w-20 rounded-md bg-black/40 border border-[oklch(0.85_0.008_250/0.2)] px-3 py-2 text-sm outline-none focus:border-gold text-center"
          />
          <button
            onClick={submit}
            className="rounded-md border border-gold/40 text-gold px-4 py-2 text-sm hover:bg-gold hover:text-primary-foreground transition flex items-center gap-1 justify-center"
          >
            <Plus className="h-4 w-4" /> Adicionar
          </button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground italic font-display text-center py-10 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
          </p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground italic font-display text-center py-10">
            Sua lista está vazia.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((it) => (
              <li
                key={it.id}
                className="flex items-center gap-3 border border-[oklch(0.85_0.008_250/0.12)] bg-black/30 rounded-md px-3 py-2.5"
              >
                <input
                  type="checkbox"
                  checked={it.is_checked}
                  onChange={() => toggle(it)}
                  className="h-4 w-4 accent-[oklch(0.85_0.008_250)]"
                />
                <span
                  className={`flex-1 text-sm ${it.is_checked ? "line-through text-muted-foreground" : ""}`}
                >
                  {it.name}
                </span>
                <span className="text-xs text-gold font-mono">×{it.quantity}</span>
                <button
                  onClick={() => remove(it.id)}
                  className="text-magenta opacity-70 hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
