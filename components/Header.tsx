import Link from "next/link";
import { Suspense } from "react";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { appConfig } from "@/app.config";

const clerkAppearance = {
  variables: {
    colorPrimary: appConfig.accent,
  },
};

export function Header() {
  return (
    <header className="border-b border-black/10 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <span aria-hidden>{appConfig.emoji}</span>
          {appConfig.name}
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/institutions" className="hover:text-accent">
            Instituições
          </Link>
          <Link href="/needs" className="hover:text-accent">
            Necessidades
          </Link>
          <Link href="/map" className="hover:text-accent">
            Mapa
          </Link>
          <Link href="/match" className="hover:text-accent">
            Combinar
          </Link>
          <Link href="/messages" className="hover:text-accent">
            Mensagens
          </Link>
          <Link href="/history" className="hover:text-accent">
            Doações
          </Link>
          <Link href="/dashboard" className="hover:text-accent">
            Painel
          </Link>
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
