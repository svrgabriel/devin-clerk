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
  const norm = normalizeDonorId(decodeURIComponent(id));
  if (!norm) notFound();

  const sql = await db();
  const col = donorIdNormSql("clerk_user_id");
  const [profile] = await sql`
    SELECT clerk_user_id, description, instagram, facebook, website, photo_url
    FROM donor_profiles
    WHERE ${sql.unsafe(col)} = ${norm}
       OR ${norm} LIKE ${sql.unsafe(col)} || '%'
       OR ${sql.unsafe(col)} LIKE ${norm} || '%'
    LIMIT 1
  `;

  const clerkId = profile?.clerk_user_id ?? null;
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
  } else {
    const [row] = await sql`
      SELECT donor_name FROM in_person_donations
      WHERE ${sql.unsafe(donorIdNormSql("donor_user_id"))} = ${norm}
         OR ${norm} LIKE ${sql.unsafe(donorIdNormSql("donor_user_id"))} || '%'
         OR ${sql.unsafe(donorIdNormSql("donor_user_id"))} LIKE ${norm} || '%'
      ORDER BY created_at DESC LIMIT 1
    `;
    if (row?.donor_name) name = row.donor_name;
  }
  if (!profile && !clerkId && name === "Doador") notFound();

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
