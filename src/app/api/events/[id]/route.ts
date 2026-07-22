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

// PUT /api/events/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const body = await request.json();
    const { description, severity, scor_phase, year } = body;

    const updated = await prisma.riskEvent.update({
      where: { id: parseInt(id) },
      data: {
        ...(description && { description }),
        ...(severity && { severity: Number(severity) }),
        ...(scor_phase && { scor_phase }),
        ...(year && { year: Number(year) }),
      },
    });

    // Severity berubah → recalculate semua ARP
    if (severity) await recalculateArp();

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        division: (user as any).division || "Divisi Produksi",
        action: `Mengubah Risk Event (${updated.code_e})`,
      },
    });

    return Response.json({ data: updated });
  } catch (err) {
    console.error("[PUT /api/events/[id]]", err);
    return Response.json({ error: "Gagal memperbarui Risk Event." }, { status: 500 });
  }
}

// DELETE /api/events/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const event = await prisma.riskEvent.delete({
      where: { id: parseInt(id) },
    });

    // Cascade delete correlations, then recalculate ARP
    await recalculateArp();

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        division: (user as any).division || "Divisi Produksi",
        action: `Menghapus Risk Event (${event.code_e})`,
      },
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/events/[id]]", err);
    return Response.json({ error: "Gagal menghapus Risk Event." }, { status: 500 });
  }
}
