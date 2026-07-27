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

// GET /api/action-correlations?year=2026
// Returns matrix: agents x actions with r_values
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorizedResponse();

  try {
    const { searchParams } = request.nextUrl;
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : 2026;

    const [agents, actions, correlations] = await Promise.all([
      prisma.riskAgent.findMany({ where: { year } }),
      prisma.preventiveAction.findMany({ where: { year } }),
      prisma.actionCorrelation.findMany({
        where: { agent: { year } },
      }),
    ]);

    agents.sort((a, b) => a.code_pa.localeCompare(b.code_pa, undefined, { numeric: true, sensitivity: "base" }));
    actions.sort((a, b) => a.code_action.localeCompare(b.code_action, undefined, { numeric: true, sensitivity: "base" }));

    // Build lookup: "agent_id:action_id" -> r_value
    const rMatrix: Record<string, number> = {};
    for (const c of correlations) {
      rMatrix[`${c.agent_id}:${c.action_id}`] = c.r_value;
    }

    return Response.json({ data: { agents, actions, rMatrix } });
  } catch (err) {
    console.error("[GET /api/action-correlations]", err);
    return Response.json({ error: "Gagal mengambil data matriks mitigasi." }, { status: 500 });
  }
}

// PUT /api/action-correlations — upsert one R value
export async function PUT(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorizedResponse();

  try {
    const { agent_id, action_id, r_value } = await request.json();

    if (![0, 1, 3, 9].includes(Number(r_value))) {
      return Response.json({ error: "Nilai R harus 0, 1, 3, atau 9." }, { status: 400 });
    }

    const corr = await prisma.actionCorrelation.upsert({
      where: { agent_id_action_id: { agent_id: Number(agent_id), action_id: Number(action_id) } },
      update: { r_value: Number(r_value) },
      create: { agent_id: Number(agent_id), action_id: Number(action_id), r_value: Number(r_value) },
    });

    await recalculateEtd();

    return Response.json({ data: corr });
  } catch (err) {
    console.error("[PUT /api/action-correlations]", err);
    return Response.json({ error: "Gagal memperbarui nilai korelasi mitigasi." }, { status: 500 });
  }
}
