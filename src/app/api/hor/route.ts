import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getAuthUser, unauthorizedResponse } from "@/lib/auth-middleware";

// GET /api/hor?year=2026
// Returns complete HOR Phase 1 result: sorted agents by ARP with breakdown
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorizedResponse();

  try {
    const { searchParams } = request.nextUrl;
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : 2026;

    const agents = await prisma.riskAgent.findMany({
      where: { year },
      orderBy: { rank: "asc" },
      include: {
        correlations: {
          include: { event: true },
        },
      },
    });

    const result = agents.map((ag) => {
      // ARP_j = O_j × Σ(S_i × R_ij)
      const breakdown = ag.correlations.map((c) => ({
        event_id: c.event_id,
        event_code: c.event.code_e,
        event_desc: c.event.description,
        severity: c.event.severity,
        r_value: c.r_value,
        contribution: c.event.severity * c.r_value,
      }));
      const sumSR = breakdown.reduce((s, b) => s + b.contribution, 0);
      const arp = ag.occurrence * sumSR;

      return {
        id: ag.id,
        rank: ag.rank,
        code_pa: ag.code_pa,
        description: ag.description,
        occurrence: ag.occurrence,
        arp_score: arp,
        scor_phase: ag.scor_phase,
        code_pa_ref: ag.code_pa_ref,
        year: ag.year,
        sumSR,
        breakdown,
      };
    });

    return Response.json({ data: result, year });
  } catch (err) {
    console.error("[GET /api/hor]", err);
    return Response.json({ error: "Gagal menghitung data HOR." }, { status: 500 });
  }
}
