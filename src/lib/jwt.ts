import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-dev-only";
const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface JWTPayload {
  id: number;
  username: string;
  name: string;
  role: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h") // Token valid for 24 hours
    .sign(secretKey);
  return token;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as JWTPayload;
  } catch (err) {
    return null;
  }
}
