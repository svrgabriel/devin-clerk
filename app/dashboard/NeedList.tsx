"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Need = { id: number; item: string; priority: string };

const PRIORITIES = ["urgente", "alta", "normal"];

export function NeedList({ needs }: { needs: Need[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<number | null>(null);
  const [item, setItem] = useState("");
  const [priority, setPriority] = useState("normal");
  const [busy, setBusy] = useState(false);

  function startEdit(n: Need) {
    setEditing(n.id);
    setItem(n.item);
    setPriority(n.priority);
  }

  async function save(id: number) {
    setBusy(true);
    const res = await fetch(`/api/needs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item, priority }),
    });
    setBusy(false);
    if (res.ok) {
      setEditing(null);
      router.refresh();
    }
  }

  async function remove(id: number) {
    setBusy(true);
    const res = await fetch(`/api/needs/${id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) router.refresh();
  }

  return (
    <ul className="flex flex-col gap-1 text-sm">
      {needs.map((n) => (
        <li key={n.id} className="flex items-center justify-between gap-3">
          {editing === n.id ? (
            <div className="flex flex-1 items-center gap-2">
              <input
                value={item}
                onChange={(e) => setItem(e.target.value)}
                className="min-w-32 flex-1 rounded-lg border border-black/15 px-2 py-1"
              />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="rounded-lg border border-black/15 px-2 py-1"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <button
                onClick={() => save(n.id)}
                disabled={busy}
                className="text-accent hover:underline disabled:opacity-60"
              >
                Salvar
              </button>
              <button
                onClick={() => setEditing(null)}
                className="text-black/50 hover:underline"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <>
              <span>
                <span className="font-medium">{n.item}</span>{" "}
                <span className="text-black/50">({n.priority})</span>
              </span>
              <span className="flex gap-3">
                <button
                  onClick={() => startEdit(n)}
                  className="text-accent hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => remove(n.id)}
                  disabled={busy}
                  className="text-black/50 hover:text-red-500 hover:underline disabled:opacity-60"
                >
                  Remover
                </button>
              </span>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
