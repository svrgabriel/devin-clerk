"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { appConfig } from "@/app.config";

const clerkAppearance = {
  variables: {
    colorPrimary: appConfig.accent,
  },
};

function NavMenu({
  label,
  items,
}: {
  label: string;
  items: { href: string; label: string; badge?: number }[];
}) {
  return (
    <div className="group relative">
      <button className="flex items-center gap-1 hover:text-accent">
        {label}
        <svg
          className="h-3 w-3 transition-transform group-hover:rotate-180"
          viewBox="0 0 10 6"
          fill="none"
          aria-hidden
        >
          <path
            d="M1 1l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div className="invisible absolute left-0 top-full z-50 min-w-44 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <div className="rounded-xl border border-black/10 bg-white py-2 shadow-lg">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => e.currentTarget.blur()}
              className="flex items-center justify-between gap-2 px-4 py-2 hover:bg-accent/10 hover:text-accent"
            >
              {item.label}
              {item.badge ? (
                <span className="min-w-5 rounded-full bg-accent px-1.5 py-0.5 text-center text-xs font-semibold text-white">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    fetch("/api/messages/unread")
      .then((r) => (r.ok ? r.json() : { count: 0 }))
      .then((d) => setUnread(d.count ?? 0))
      .catch(() => {});
  }, []);
  return (
    <header className="border-b border-black/10 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <span aria-hidden>{appConfig.emoji}</span>
          {appConfig.name}
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <NavMenu
            label="Explorar"
            items={[
              { href: "/institutions", label: "Instituições" },
              { href: "/needs", label: "Necessidades" },
              { href: "/map", label: "Mapa" },
            ]}
          />
          <NavMenu
            label="Doar"
            items={[
              { href: "/match", label: "Combinar" },
              { href: "/history", label: "Minhas doações" },
            ]}
          />
          <NavMenu
            label="Conta"
            items={[
              { href: "/dashboard", label: "Painel" },
              { href: "/messages", label: "Mensagens", badge: unread },
            ]}
          />
          <Suspense>
            <Show when="signed-out">
              <div className="flex items-center gap-3">
                <SignInButton>
                  <button className="font-medium hover:text-accent">
                    Entrar
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="rounded-full bg-accent px-4 py-2 font-medium text-white transition hover:opacity-90">
                    Cadastrar
                  </button>
                </SignUpButton>
              </div>
            </Show>
            <Show when="signed-in">
              <UserButton appearance={clerkAppearance} />
            </Show>
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
