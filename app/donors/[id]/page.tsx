import { notFound } from "next/navigation";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/profile";
import { donorCode, donorIdNormSql, normalizeDonorId } from "@/lib/donor";

export default async function DonorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireProfile();
  const { id } = await params;
  const norm = normalizeDonorId(id);
  if (!norm) notFound();

  const sql = await db();

  const profNorm = donorIdNormSql("clerk_user_id");
  const [profile] = await sql`
    SELECT clerk_user_id, description, instagram, facebook, website, photo_url
    FROM donor_profiles
    WHERE ${sql.unsafe(profNorm)} = ${norm}
       OR ${sql.unsafe(profNorm)} LIKE ${norm} || '%'
    LIMIT 1
  `;

  // Resolve a real Clerk user id: profile row, or a money donation that stored it.
  let clerkId: string | null = profile?.clerk_user_id ?? null;
  if (!clerkId) {
    const donNorm = donorIdNormSql("donor_user_id");
    const [donation] = await sql`
      SELECT donor_user_id FROM donations
      WHERE ${sql.unsafe(donNorm)} = ${norm}
      LIMIT 1
    `;
    if (donation?.donor_user_id?.startsWith("user_")) {
      clerkId = donation.donor_user_id;
    }
  }

  // Existence: profile, or any donation row referencing this donor.
  let exists = Boolean(profile);
  if (!exists) {
    const ipNorm = donorIdNormSql("donor_user_id");
    const [row] = await sql`
      SELECT 1 FROM (
        SELECT donor_user_id FROM donations
        UNION ALL
        SELECT donor_user_id FROM in_person_donations
      ) t
      WHERE ${sql.unsafe(ipNorm)} = ${norm}
      LIMIT 1
    `;
    exists = Boolean(row) || Boolean(clerkId);
  }
  if (!exists) notFound();

  // Only trust Clerk for the display name — never institution-submitted text.
  let name = "Doador";
  if (clerkId) {
    try {
      const user = await (await clerkClient()).users.getUser(clerkId);
      name =
        [user.firstName, user.lastName].filter(Boolean).join(" ") ||
        user.primaryEmailAddress?.emailAddress?.split("@")[0] ||
        name;
    } catch {
      /* keep fallback name */
    }
  }

  const social = [
    { label: "Instagram", url: profile?.instagram },
    { label: "Facebook", url: profile?.facebook },
    { label: "Site", url: profile?.website },
  ].filter((s) => s.url);

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-12">
      <div className="flex items-center gap-4">
        {profile?.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.photo_url}
            alt={`Foto de ${name}`}
            className="h-16 w-16 rounded-full border border-black/10 object-cover"
          />
        ) : null}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold">{name}</h1>
          {clerkId && (
            <span className="font-mono text-xs text-black/50">
              {donorCode(clerkId)}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl border border-black/10 bg-white p-5">
        <h2 className="font-semibold">Sobre</h2>
        <p className="whitespace-pre-line text-sm text-black/80">
          {profile?.description || "Este doador ainda não escreveu sobre si."}
        </p>
      </div>

      {social.length > 0 && (
        <div className="flex flex-wrap gap-3 text-sm">
          {social.map((s) => (
            <a
              key={s.label}
              href={s.url!}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-black/15 px-4 py-1.5 hover:border-accent/40 hover:text-accent"
            >
              {s.label}
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
