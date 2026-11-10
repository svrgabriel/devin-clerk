import { auth } from "@clerk/nextjs/server";
import { appConfig } from "@/app.config";

export async function GET() {
  const { isAuthenticated } = await auth();

  if (!isAuthenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({ features: appConfig.upcomingFeatures });
}
