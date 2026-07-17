import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { signToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { username?: string; password?: string };
    const { username, password } = body;

    if (!username || !password) {
      return Response.json(
        { error: "Username dan password wajib diisi." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      return Response.json(
        { error: "Username atau password salah." },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return Response.json(
        { error: "Username atau password salah." },
        { status: 401 }
      );
    }

    const token = await signToken({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    });

    // Return safe user object (no password) + token
    return Response.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        division: user.division,
        role: user.role,
      }
    });
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}
