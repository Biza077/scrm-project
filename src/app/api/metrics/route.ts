import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getAuthUser, unauthorizedResponse } from "@/lib/auth-middleware";

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorizedResponse();

  try {
    const { searchParams } = request.nextUrl;
    const yearParam = searchParams.get("year");
    const year = yearParam ? parseInt(yearParam, 10) : 2024;

    const metrics = await prisma.productionMetric.findMany({
      where: { year },
      orderBy: { id: "asc" },
    });

    return Response.json({ data: metrics, year });
  } catch (err) {
    console.error("[GET /api/metrics]", err);
    return Response.json({ error: "Gagal mengambil data metrik produksi." }, { status: 500 });
  }
}
