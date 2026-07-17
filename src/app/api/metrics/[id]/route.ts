import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorizedResponse } from "@/lib/auth-middleware";

// PUT /api/metrics/[id] — Update a Production Metric
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const metricId = parseInt(id, 10);
    const body = await request.json();
    
    const { rainfall_mm, raw_tea_ton, dry_tea_ton } = body;

    const updatedMetric = await prisma.productionMetric.update({
      where: { id: metricId },
      data: {
        rainfall_mm: Number(rainfall_mm),
        raw_tea_ton: Number(raw_tea_ton),
        dry_tea_ton: Number(dry_tea_ton),
      },
    });

    return Response.json({ data: updatedMetric });
  } catch (err) {
    console.error("[PUT /api/metrics/[id]]", err);
    return Response.json({ error: "Failed to update production metric." }, { status: 500 });
  }
}
