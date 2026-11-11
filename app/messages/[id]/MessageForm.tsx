"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function MessageForm({ conversationId }: { conversationId: number }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    await fetch(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    setBody("");
    setSending(false);
    router.refresh();
  }

  return (
    <form onSubmit={send} className="flex gap-3">
      <input
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Escreva sua mensagem…"
        className="flex-1 rounded-full border border-black/15 px-4 py-3"
      />
      <button
        type="submit"
        disabled={sending || !body.trim()}
        className="rounded-full bg-accent px-5 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-60"
      >
        Enviar
      </button>
    </form>
  );
}
