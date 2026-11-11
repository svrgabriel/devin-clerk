import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export type Role = "doador" | "instituicao";

export async function requireProfile() {
  const { userId, sessionClaims, isAuthenticated } = await auth();
  if (!isAuthenticated || !userId) redirect("/sign-in");

  const meta = sessionClaims?.metadata as { role?: Role } | undefined;
  if (!meta?.role) redirect("/onboarding");

  return { userId, role: meta.role };
}

export async function setRoleMetadata(userId: string, role: Role) {
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { role },
  });
}
