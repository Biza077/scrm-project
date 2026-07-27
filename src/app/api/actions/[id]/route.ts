import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getAuthUser, unauthorizedResponse } from "@/lib/auth-middleware";

async function recalculateEtd() {
  const agents = await prisma.riskAgent.findMany({ select: { id: true, arp_score: true } });
  const arpLookup: Record<number, number> = Object.fromEntries(agents.map((ag) => [ag.id, ag.arp_score]));

  const actions = await prisma.preventiveAction.findMany({ include: { correlations: true } });
  const etdResults = actions.map((action) => {
    const te = action.correlations.reduce((sum, c) => sum + (arpLookup[c.agent_id] || 0) * c.r_value, 0);
    const etd = action.difficulty > 0 ? te / action.difficulty : 0;
    return { id: action.id, te, etd };
  });
  etdResults.sort((a, b) => b.etd - a.etd);
  for (let i = 0; i < etdResults.length; i++) {
    await prisma.preventiveAction.update({
      where: { id: etdResults[i].id },
      data: { te_score: etdResults[i].te, etd_score: etdResults[i].etd, rank: i + 1 },
    });
  }
}

// PUT /api/actions/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const body = await request.json();
    const { description, difficulty, scor_phase, year } = body;

    if (difficulty !== undefined && (Number(difficulty) < 3 || Number(difficulty) > 5)) {
      return Response.json({ error: "Difficulty harus antara 3–5." }, { status: 400 });
    }

    const updated = await prisma.preventiveAction.update({
      where: { id: parseInt(id) },
      data: {
        ...(description !== undefined && { description }),
        ...(difficulty !== undefined && { difficulty: Number(difficulty) }),
        ...(scor_phase !== undefined && { scor_phase: scor_phase || null }),
        ...(year !== undefined && { year: Number(year) }),
      },
    });

    if (difficulty !== undefined) await recalculateEtd();

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        division: (user as any).division || "Divisi Produksi",
        action: `Mengubah Tindakan Pencegahan (${updated.code_action})`,
      },
    });

    return Response.json({ data: updated });
  } catch (err) {
    console.error("[PUT /api/actions/[id]]", err);
    return Response.json({ error: "Gagal memperbarui Tindakan Pencegahan." }, { status: 500 });
  }
}

// DELETE /api/actions/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const action = await prisma.preventiveAction.delete({ where: { id: parseInt(id) } });
    await recalculateEtd();

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        division: (user as any).division || "Divisi Produksi",
        action: `Menghapus Tindakan Pencegahan (${action.code_action})`,
      },
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/actions/[id]]", err);
    return Response.json({ error: "Gagal menghapus Tindakan Pencegahan." }, { status: 500 });
  }
}
