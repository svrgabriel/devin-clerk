"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Msg = { id: number; sender_user_id: string; body: string };

export function MessageList({
  messages,
  userId,
}: {
  messages: Msg[];
  userId: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<number | null>(null);

  async function del(id: number) {
    setDeleting(id);
    const res = await fetch(`/api/messages/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else setDeleting(null);
  }

  if (messages.length === 0) {
    return <p className="text-black/60">Nenhuma mensagem ainda. Diga olá!</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      {messages.map((msg) => {
        const mine = msg.sender_user_id === userId;
        return (
          <div
            key={msg.id}
            className={`group flex max-w-[80%] items-center gap-2 ${
              mine ? "self-end" : "self-start"
            }`}
          >
            <div
              className={`rounded-2xl px-4 py-3 text-sm ${
                mine
                  ? "bg-accent text-white"
                  : "border border-black/10 bg-white"
              }`}
            >
              {msg.body}
            </div>
            {mine && (
              <button
                onClick={() => del(msg.id)}
                disabled={deleting === msg.id}
                title="Apagar mensagem"
                className="text-xs text-black/40 opacity-0 transition group-hover:opacity-100 hover:text-red-600 disabled:opacity-100"
              >
                {deleting === msg.id ? "…" : "Apagar"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function BlockToggle({
  conversationId,
  blocked,
}: {
  conversationId: number;
  blocked: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function toggle() {
    setSaving(true);
    const res = await fetch(`/api/conversations/${conversationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocked: !blocked }),
    });
    if (res.ok) router.refresh();
    setSaving(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={saving}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition disabled:opacity-60 ${
        blocked
          ? "border-red-300 text-red-600 hover:bg-red-50"
          : "border-black/15 text-black/60 hover:border-red-300 hover:text-red-600"
      }`}
    >
      {blocked ? "Desbloquear conversa" : "Bloquear conversa"}
    </button>
  );
}
