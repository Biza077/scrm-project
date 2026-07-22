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

// GET /api/agents?year=2026
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorizedResponse();

  try {
    const { searchParams } = request.nextUrl;
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined;

    const agents = await prisma.riskAgent.findMany({
      where: year ? { year } : undefined,
      orderBy: { rank: "asc" },
    });

    return Response.json({ data: agents });
  } catch (err) {
    console.error("[GET /api/agents]", err);
    return Response.json({ error: "Gagal mengambil data Risk Agent." }, { status: 500 });
  }
}

// POST /api/agents
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { code_pa, description, occurrence, scor_phase, code_pa_ref, year } = body;

    if (!code_pa || !description || !occurrence || !scor_phase) {
      return Response.json({ error: "Field code_pa, description, occurrence, scor_phase wajib diisi." }, { status: 400 });
    }

    const agent = await prisma.riskAgent.create({
      data: {
        code_pa,
        description,
        occurrence: Number(occurrence),
        scor_phase,
        code_pa_ref: code_pa_ref || "",
        year: Number(year) || 2026,
        arp_score: 0,
        rank: 0,
      },
    });

    await recalculateArp();

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        division: (user as any).division || "Divisi Produksi",
        action: `Menambahkan Risk Agent baru (${code_pa})`,
      },
    });

    return Response.json({ data: agent }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/agents]", err);
    if (err.code === "P2002") {
      return Response.json({ error: "Kode PA sudah digunakan." }, { status: 400 });
    }
    return Response.json({ error: "Gagal membuat Risk Agent." }, { status: 500 });
  }
}
