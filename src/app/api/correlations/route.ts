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

// GET /api/correlations?year=2026
// Returns full matrix: events × agents with r_values
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorizedResponse();

  try {
    const { searchParams } = request.nextUrl;
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : 2026;

    const [events, agents, correlations] = await Promise.all([
      prisma.riskEvent.findMany({ where: { year } }),
      prisma.riskAgent.findMany({ where: { year } }),
      prisma.correlation.findMany({
        where: { event: { year } },
        include: { event: true, agent: true },
      }),
    ]);

    events.sort((a, b) => a.code_e.localeCompare(b.code_e, undefined, { numeric: true, sensitivity: "base" }));
    agents.sort((a, b) => a.code_pa.localeCompare(b.code_pa, undefined, { numeric: true, sensitivity: "base" }));

    // Build lookup: { "event_id:agent_id" → r_value }
    const rMatrix: Record<string, number> = {};
    for (const c of correlations) {
      rMatrix[`${c.event_id}:${c.agent_id}`] = c.r_value;
    }

    return Response.json({ data: { events, agents, rMatrix } });
  } catch (err) {
    console.error("[GET /api/correlations]", err);
    return Response.json({ error: "Gagal mengambil data korelasi." }, { status: 500 });
  }
}

// PUT /api/correlations — upsert satu nilai R
export async function PUT(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorizedResponse();

  try {
    const { event_id, agent_id, r_value } = await request.json();

    if (![0, 1, 3, 9].includes(Number(r_value))) {
      return Response.json({ error: "Nilai R harus 0, 1, 3, atau 9." }, { status: 400 });
    }

    const corr = await prisma.correlation.upsert({
      where: { event_id_agent_id: { event_id: Number(event_id), agent_id: Number(agent_id) } },
      update: { r_value: Number(r_value) },
      create: { event_id: Number(event_id), agent_id: Number(agent_id), r_value: Number(r_value) },
    });

    await recalculateArp();

    return Response.json({ data: corr });
  } catch (err) {
    console.error("[PUT /api/correlations]", err);
    return Response.json({ error: "Gagal memperbarui nilai korelasi." }, { status: 500 });
  }
}
