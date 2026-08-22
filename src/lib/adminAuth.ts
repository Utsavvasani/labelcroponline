import crypto from "crypto";
import { NextRequest } from "next/server";

const SECRET = process.env.ADMIN_JWT_SECRET || "default_super_secure_labelcrop_secret_key_2026";
const TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function createAdminToken(email: string): string {
  const payload = {
    email,
    timestamp: Date.now(),
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("base64url");

  return `${data}.${signature}`;
}

export function verifyAdminToken(token?: string | null): { valid: boolean; email?: string } {
  if (!token) return { valid: false };

  const parts = token.split(".");
  if (parts.length !== 2) return { valid: false };

  const [data, signature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("base64url");

  if (signature !== expectedSignature) {
    return { valid: false };
  }

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (!payload.email || !payload.timestamp) {
      return { valid: false };
    }

    // Check expiration
    if (Date.now() - payload.timestamp > TOKEN_MAX_AGE_MS) {
      return { valid: false };
    }

    // Check if email matches configured admin email
    const configuredAdminEmail = process.env.ADMIN_EMAIL || "admin@labelcroponline.com";
    if (payload.email.toLowerCase() !== configuredAdminEmail.toLowerCase()) {
      return { valid: false };
    }

    return { valid: true, email: payload.email };
  } catch {
    return { valid: false };
  }
}

export function checkAdminAuth(request: NextRequest): boolean {
  const tokenCookie = request.cookies.get("admin_session_token")?.value;
  const { valid } = verifyAdminToken(tokenCookie);
  return valid;
}
