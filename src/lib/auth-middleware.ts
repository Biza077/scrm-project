import { NextRequest } from "next/server";
import { verifyToken, JWTPayload } from "./jwt";

export async function getAuthUser(request: NextRequest): Promise<JWTPayload | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  const user = await verifyToken(token);
  return user;
}

export function unauthorizedResponse() {
  return Response.json(
    { error: "Unauthorized. Token tidak valid atau tidak ditemukan." },
    { status: 401 }
  );
}
