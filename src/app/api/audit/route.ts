import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorizedResponse } from "@/lib/auth-middleware";

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorizedResponse();

  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    
    return Response.json({ data: logs }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[GET /api/audit]", err);
    return Response.json({ error: "Failed to fetch audit logs." }, { status: 500 });
  }
}
