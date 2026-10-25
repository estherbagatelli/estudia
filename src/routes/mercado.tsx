import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useShopping } from "@/hooks/useShopping";
import { useState, useMemo } from "react";
import { Plus, Trash2, Loader2, Check, ShoppingBag, Tag } from "lucide-react";
import { toast } from "sonner";
import type { ShoppingItem } from "@/types/models";

export const Route = createFileRoute("/mercado")({
  head: () => ({ meta: [{ title: "Mercado — Estudia" }] }),
  component: MercadoPage,
});

function MercadoPage() {
  const { items, categoriasUsadas, isLoading, add, toggle, remove } = useShopping();
  const [name, setName] = useState("");
  const [qty, setQty] = useState("1");
  const [category, setCategory] = useState("");

  const submit = () => {
    if (!name.trim()) {
      toast.error("Informe o nome do item.");
      return;
    }
    const q = Math.max(1, parseInt(qty, 10) || 1);
    add(name.trim(), q, category.trim() || null);
    toast.success("Item adicionado à lista!");
    setName("");
    setQty("1");
    // Mantém ou limpa a categoria de acordo com conveniência, limpamos para o próximo
  };

  const handleToggle = (it: ShoppingItem) => {
    toggle(it);
  };

  const handleRemove = (id: string) => {
    remove(id);
    toast.success("Item removido.");
  };

  // Agrupamento por categoria (itens sem categoria vão para "Outros")
  const groupedItems = useMemo(() => {
    const groups: Record<string, ShoppingItem[]> = {};

    for (const item of items) {
      const cat = item.category?.trim() || "Outros";
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(item);
    }

    // Ordena as categorias colocando "Outros" no fim se houver mais de uma
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === "Outros") return 1;
      if (b === "Outros") return -1;
      return a.localeCompare(b);
    });

    return sortedKeys.map((catKey) => ({
      category: catKey,
      items: groups[catKey],
    }));
  }, [items]);

  const totalComprados = items.filter((i) => i.is_checked).length;

  return (
    <AppShell title="Mercado" subtitle="Lista de compras inteligente por categorias">
      <div className="max-w-3xl space-y-6">
        {/* Formulário de adicionar item */}
        <section className="glass-card p-5 rounded-xl border border-border">
          <h3 className="font-display text-base text-gold mb-3 flex items-center gap-1.5">
            <ShoppingBag className="h-4 w-4" /> Novo item de compra
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Item (ex: Leite, Maçã, Detergente)"
              className="sm:col-span-5 rounded-md bg-background/60 border border-border px-3 py-2 text-sm outline-none focus:border-gold"
            />

            <input
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Qtd"
              title="Quantidade"
              type="number"
              min="1"
              className="sm:col-span-2 rounded-md bg-background/60 border border-border px-3 py-2 text-sm outline-none focus:border-gold text-center"
            />

            {/* Campo livre com sugestão das categorias já usadas (Item 6) */}
            <div className="sm:col-span-3 relative">
              <input
                list="categorias-sugeridas"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="Categoria (ex: Hortifruti)"
                className="w-full rounded-md bg-background/60 border border-border px-3 py-2 text-sm outline-none focus:border-gold"
              />
              <datalist id="categorias-sugeridas">
                {categoriasUsadas.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            <button
              onClick={submit}
              className="sm:col-span-2 rounded-md border border-gold/40 text-gold px-4 py-2 text-sm hover:bg-gold hover:text-background transition flex items-center gap-1 justify-center font-medium"
            >
              <Plus className="h-4 w-4" /> Adicionar
            </button>
          </div>

          {/* Atalhos rápidos de categorias já usadas */}
          {categoriasUsadas.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-border/30 text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Tag className="h-3 w-3" /> Suas categorias:
              </span>
              {categoriasUsadas.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-2 py-0.5 rounded-full border text-[11px] transition ${
                    category === cat
                      ? "border-gold text-gold bg-gold/15"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Lista e Estado Vazio */}
        {isLoading ? (
          <p className="text-sm text-muted-foreground italic font-display text-center py-10 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando lista…
          </p>
        ) : items.length === 0 ? (
          /* Estado vazio combinado com Esther */
          <div className="glass-card p-10 rounded-xl border border-border text-center">
            <p className="text-sm text-muted-foreground italic">
              Sua lista está vazia. Adicione os itens que precisa comprar.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-muted-foreground font-mono">
                {totalComprados}/{items.length} itens marcados
              </span>
            </div>

            {/* Lista agrupada por categoria (Item 6) */}
            {groupedItems.map((group) => (
              <section
                key={group.category}
                className="glass-card p-5 rounded-xl border border-border space-y-2.5"
              >
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <h4 className="font-display text-base text-gold font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gold/80" />
                    {group.category}
                  </h4>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {group.items.filter((i) => i.is_checked).length}/{group.items.length}
                  </span>
                </div>

                <ul className="space-y-2">
                  {group.items.map((it) => (
                    <li
                      key={it.id}
                      className={`flex items-center gap-3 border rounded-lg px-3 py-2.5 transition ${
                        it.is_checked
                          ? "border-border/40 bg-card/30 opacity-70"
                          : "border-border bg-card/70"
                      }`}
                    >
                      <button
                        onClick={() => handleToggle(it)}
                        className={`h-4 w-4 rounded border flex items-center justify-center transition shrink-0 ${
                          it.is_checked
                            ? "bg-magenta border-magenta"
                            : "border-border hover:border-gold"
                        }`}
                        title={it.is_checked ? "Desmarcar item" : "Marcar item como comprado"}
                      >
                        {it.is_checked && (
                          <Check className="h-3 w-3 text-background" strokeWidth={2.5} />
                        )}
                      </button>

                      <span
                        className={`flex-1 text-sm font-medium ${
                          it.is_checked ? "line-through text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {it.name}
                      </span>

                      <span className="text-xs text-gold font-mono px-2 py-0.5 rounded bg-background/50 border border-border/50">
                        ×{it.quantity}
                      </span>

                      <button
                        onClick={() => handleRemove(it.id)}
                        className="text-muted-foreground hover:text-darkred transition p-1"
                        aria-label="Excluir item"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
