import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorizedResponse } from "@/lib/auth-middleware";

// PUT /api/risks/[id] — Update a Risk Agent
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const body = await request.json();
    const {
      deskripsi,
      severity,
      occurrence,
      detection,
      kategoriSCOR,
      preventiveAction,
      kodePR,
    } = body;

    const s = Number(severity);
    const o = Number(occurrence);
    const d = Number(detection);
    const arp = s * o * d;

    const updatedRisk = await prisma.riskAgent.update({
      where: { code_ra: id }, // Frontend uses code_ra as identifier
      data: {
        description: deskripsi,
        s_score: s,
        o_score: o,
        d_score: d,
        arp_score: arp,
        scor_phase: kategoriSCOR,
        preventive_action: preventiveAction,
        code_pr: kodePR,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        division: (user as any).division || "Divisi Produksi",
        action: `Mengubah Agen Risiko (${id})`,
      },
    });

    return Response.json({ data: updatedRisk });
  } catch (err) {
    console.error("[PUT /api/risks/[id]]", err);
    return Response.json({ error: "Failed to update risk agent.", details: err.message }, { status: 500 });
  }
}

// DELETE /api/risks/[id] — Delete a Risk Agent
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    await prisma.riskAgent.delete({
      where: { code_ra: id },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        division: (user as any).division || "Divisi Produksi",
        action: `Menghapus Agen Risiko (${id})`,
      },
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/risks/[id]]", err);
    return Response.json({ error: "Failed to delete risk agent." }, { status: 500 });
  }
}
