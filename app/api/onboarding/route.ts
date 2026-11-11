import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { setRoleMetadata, type Role } from "@/lib/profile";

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export async function POST(req: Request) {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated || !userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role, document, orgName } = (await req.json()) as {
    role?: Role;
    document?: string;
    orgName?: string;
  };

  if (role !== "doador" && role !== "instituicao") {
    return Response.json({ error: "Escolha um perfil válido." }, { status: 400 });
  }
  if (!document) {
    return Response.json(
      { error: "Informe o documento." },
      { status: 400 },
    );
  }

  const digits = digitsOnly(document);
  if (role === "doador" && digits.length !== 11) {
    return Response.json({ error: "CPF inválido." }, { status: 400 });
  }
  if (role === "instituicao") {
    if (digits.length !== 14) {
      return Response.json({ error: "CNPJ inválido." }, { status: 400 });
    }
    if (!orgName?.trim()) {
      return Response.json(
        { error: "Informe o nome da instituição." },
        { status: 400 },
      );
    }
  }

  const sql = db();
  if (role === "instituicao") {
    await sql`
      INSERT INTO institutions (clerk_user_id, name, cause, city, cnpj)
      VALUES (${userId}, ${orgName!.trim()}, 'Instituição beneficente', '', ${digits})
      ON CONFLICT DO NOTHING
    `;
  }
  await setRoleMetadata(userId, role);

  return Response.json({ ok: true });
}
