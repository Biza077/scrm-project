import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getAuthUser, unauthorizedResponse } from "@/lib/auth-middleware";

// GET /api/hor2?year=2026
// Returns ranked preventive actions with TE and ETD breakdown
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorizedResponse();

  try {
    const { searchParams } = request.nextUrl;
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : 2026;

    const actions = await prisma.preventiveAction.findMany({
      where: { year },
      orderBy: { rank: "asc" },
      include: {
        correlations: {
          include: { agent: true },
        },
      },
    });

    const result = actions.map((action) => {
      // TE_k = Σ(ARP_j × R_jk)
      const breakdown = action.correlations.map((c) => ({
        agent_id: c.agent_id,
        agent_code: c.agent.code_pa,
        agent_desc: c.agent.description,
        arp: c.agent.arp_score,
        r_value: c.r_value,
        contribution: c.agent.arp_score * c.r_value,
      }));
      const te = breakdown.reduce((sum, b) => sum + b.contribution, 0);
      const etd = action.difficulty > 0 ? te / action.difficulty : 0;

      return {
        id: action.id,
        rank: action.rank,
        code_action: action.code_action,
        description: action.description,
        difficulty: action.difficulty,
        scor_phase: action.scor_phase,
        te_score: te,
        etd_score: etd,
        year: action.year,
        breakdown,
      };
    });

    return Response.json({ data: result, year });
  } catch (err) {
    console.error("[GET /api/hor2]", err);
    return Response.json({ error: "Gagal menghitung data HOR Fase 2." }, { status: 500 });
  }
}
