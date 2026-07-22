import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getAuthUser, unauthorizedResponse } from "@/lib/auth-middleware";

/** Recalculate ARP for all agents and update rank */
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

// GET /api/events?year=2026
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorizedResponse();

  try {
    const { searchParams } = request.nextUrl;
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined;

    const events = await prisma.riskEvent.findMany({
      where: year ? { year } : undefined,
      orderBy: { code_e: "asc" },
      include: { correlations: { include: { agent: true } } },
    });
    return Response.json({ data: events });
  } catch (err) {
    console.error("[GET /api/events]", err);
    return Response.json({ error: "Gagal mengambil data Risk Event." }, { status: 500 });
  }
}

// POST /api/events
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { code_e, description, severity, scor_phase, year } = body;

    if (!code_e || !description || !severity || !scor_phase) {
      return Response.json({ error: "Field code_e, description, severity, scor_phase wajib diisi." }, { status: 400 });
    }

    const event = await prisma.riskEvent.create({
      data: {
        code_e,
        description,
        severity: Number(severity),
        scor_phase,
        year: Number(year) || 2026,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        division: (user as any).division || "Divisi Produksi",
        action: `Menambahkan Risk Event baru (${code_e})`,
      },
    });

    return Response.json({ data: event }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/events]", err);
    if (err.code === "P2002") {
      return Response.json({ error: "Kode Event sudah digunakan." }, { status: 400 });
    }
    return Response.json({ error: "Gagal membuat Risk Event." }, { status: 500 });
  }
}
