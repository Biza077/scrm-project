import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getAuthUser, unauthorizedResponse } from "@/lib/auth-middleware";

/** Recalculate TE and ETD for all preventive actions */
async function recalculateEtd() {
  const agents = await prisma.riskAgent.findMany({ select: { id: true, arp_score: true } });
  const arpLookup: Record<number, number> = Object.fromEntries(agents.map((ag) => [ag.id, ag.arp_score]));

  const actions = await prisma.preventiveAction.findMany({
    include: { correlations: true },
  });

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

// GET /api/actions?year=2026
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorizedResponse();

  try {
    const { searchParams } = request.nextUrl;
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : 2026;

    const actions = await prisma.preventiveAction.findMany({
      where: { year },
      orderBy: { rank: "asc" },
    });

    return Response.json({ data: actions });
  } catch (err) {
    console.error("[GET /api/actions]", err);
    return Response.json({ error: "Gagal mengambil data Tindakan Pencegahan." }, { status: 500 });
  }
}

// POST /api/actions
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { code_action, description, difficulty, scor_phase, year } = body;

    if (!code_action || !description || !difficulty) {
      return Response.json({ error: "Field code_action, description, difficulty wajib diisi." }, { status: 400 });
    }
    if (!Number(difficulty) || Number(difficulty) < 3 || Number(difficulty) > 5) {
      return Response.json({ error: "Difficulty harus antara 3–5 (Rendah–Tinggi)." }, { status: 400 });
    }

    const action = await prisma.preventiveAction.create({
      data: {
        code_action,
        description,
        difficulty: Number(difficulty),
        scor_phase: scor_phase || null,
        year: Number(year) || 2026,
        te_score: 0,
        etd_score: 0,
        rank: 0,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        division: (user as any).division || "Divisi Produksi",
        action: `Menambahkan Tindakan Pencegahan baru (${code_action})`,
      },
    });

    return Response.json({ data: action }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/actions]", err);
    if (err.code === "P2002") {
      return Response.json({ error: "Kode Aksi sudah digunakan." }, { status: 400 });
    }
    return Response.json({ error: "Gagal membuat Tindakan Pencegahan." }, { status: 500 });
  }
}
