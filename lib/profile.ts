import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export type Role = "doador" | "instituicao";

export type Profile = { userId: string; role: Role | null };

export async function getProfile(): Promise<Profile | null> {
  const { userId, isAuthenticated } = await auth();
  if (!isAuthenticated || !userId) return null;

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = (user.publicMetadata as { role?: Role })?.role ?? null;
  return { userId, role };
}

/** Pages: redirect to sign-in / onboarding until the profile is complete. */
export async function requireProfile(): Promise<{ userId: string; role: Role }> {
  const profile = await getProfile();
  if (!profile) redirect("/sign-in");
  if (!profile.role) redirect("/onboarding");
  return { userId: profile.userId, role: profile.role };
}

/** API routes: a Response to return, or the profile. */
export async function apiProfile(): Promise<
  { userId: string; role: Role } | Response
> {
  const profile = await getProfile();
  if (!profile) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!profile.role) {
    return Response.json({ error: "Complete o cadastro." }, { status: 403 });
  }
  return { userId: profile.userId, role: profile.role };
}

export async function setRoleMetadata(userId: string, role: Role) {
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { role },
  });
}
