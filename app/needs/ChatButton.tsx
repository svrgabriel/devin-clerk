"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ChatButton({ institutionId }: { institutionId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function start() {
    setLoading(true);
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ institution_id: institutionId }),
    });
    if (res.ok) {
      const { id } = await res.json();
      router.push(`/messages/${id}`);
    } else {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={start}
      disabled={loading}
      className="rounded-full border border-accent px-4 py-2 text-sm font-medium text-accent transition hover:bg-accent/5 disabled:opacity-60"
    >
      {loading ? "Abrindo…" : "Conversar"}
    </button>
  );
}
