import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getAuthUser, unauthorizedResponse } from "@/lib/auth-middleware";

async function recalculateArp() {
  const agents = await prisma.riskAgent.findMany({
    include: { correlations: { include: { event: true } } },
  });
  const arps = agents.map((ag) => ({
    id: ag.id,
    arp: ag.occurrence * ag.correlations.reduce((s, c) => s + c.event.severity * c.r_value, 0),
  }));
  arps.sort((a, b) => b.arp - a.arp);
  for (let i = 0; i < arps.length; i++) {
    await prisma.riskAgent.update({
      where: { id: arps[i].id },
      data: { arp_score: arps[i].arp, rank: i + 1 },
    });
  }
}

// PUT /api/agents/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const body = await request.json();
    const { description, occurrence, scor_phase, code_pa_ref, year } = body;

    const updated = await prisma.riskAgent.update({
      where: { id: parseInt(id) },
      data: {
        ...(description !== undefined && { description }),
        ...(occurrence !== undefined && { occurrence: Number(occurrence) }),
        ...(scor_phase !== undefined && { scor_phase }),
        ...(code_pa_ref !== undefined && { code_pa_ref }),
        ...(year !== undefined && { year: Number(year) }),
      },
    });

    if (occurrence !== undefined) await recalculateArp();

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        division: (user as any).division || "Divisi Produksi",
        action: `Mengubah Risk Agent (${updated.code_pa})`,
      },
    });

    return Response.json({ data: updated });
  } catch (err) {
    console.error("[PUT /api/agents/[id]]", err);
    return Response.json({ error: "Gagal memperbarui Risk Agent." }, { status: 500 });
  }
}

// DELETE /api/agents/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const agent = await prisma.riskAgent.delete({ where: { id: parseInt(id) } });
    await recalculateArp();

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        division: (user as any).division || "Divisi Produksi",
        action: `Menghapus Risk Agent (${agent.code_pa})`,
      },
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/agents/[id]]", err);
    return Response.json({ error: "Gagal menghapus Risk Agent." }, { status: 500 });
  }
}
