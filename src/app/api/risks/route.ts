import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorizedResponse } from "@/lib/auth-middleware";

// GET /api/risks — Get all Risk Agents
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorizedResponse();

  try {
    const risks = await prisma.riskAgent.findMany({
      orderBy: { arp_score: "desc" },
    });
    
    // Add rank property dynamically based on sorting
    const rankedRisks = risks.map((r, i) => ({ ...r, rank: i + 1 }));

    return Response.json({ data: rankedRisks });
  } catch (err) {
    console.error("[GET /api/risks]", err);
    return Response.json({ error: "Failed to fetch risk agents." }, { status: 500 });
  }
}

// POST /api/risks — Create a new Risk Agent
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorizedResponse();

  try {
    const body = await request.json();
    const {
      kodeRA,
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

    const newRisk = await prisma.riskAgent.create({
      data: {
        code_ra: kodeRA,
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
        action: `Menambahkan Agen Risiko baru (${kodeRA})`,
      },
    });

    return Response.json({ data: newRisk }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/risks]", err);
    if (err.code === "P2002") {
      return Response.json({ error: "Kode RA sudah digunakan. Harap gunakan kode yang berbeda." }, { status: 400 });
    }
    return Response.json({ error: "Failed to create risk agent." }, { status: 500 });
  }
}
