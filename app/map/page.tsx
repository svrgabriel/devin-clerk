import { db } from "@/lib/db";
import { requireProfile } from "@/lib/profile";
import { MapView, type Point } from "./MapView";

export default async function MapPage() {
  await requireProfile();
  const sql = await db();
  const points = await sql<Point[]>`
    SELECT id, name, cause, city, lat, lng
    FROM institutions
    WHERE lat IS NOT NULL AND lng IS NOT NULL
    ORDER BY name
  `;

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Mapa de coleta</h1>
        <p className="text-lg text-black/70">
          Pontos de coleta das instituições — clique nos marcadores para
          detalhes.
        </p>
      </div>
      <MapView points={points} />
    </section>
  );
}
