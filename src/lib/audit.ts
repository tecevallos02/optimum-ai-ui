import { PrismaClient } from "@prisma/client";
import { headers } from "next/headers";

const prisma = new PrismaClient();

export type AuditAction =
  | "signin"
  | "signout"
  | "org:created"
  | "org:switch"
  | "invite:created"
  | "invite:accepted"
  | "role:changed"
  | "user:created"
  | "membership:created"
  | "contact:created"
  | "contact:updated"
  | "contact:deleted"
  | "complaint:created"
  | "complaint:updated"
  | "complaint:deleted"
  | "phone_number:created"
  | "phone_number:updated"
  | "phone_number:deleted"
  | "ai_receptionist:created"
  | "ai_receptionist:updated"
  | "ai_receptionist:deleted"
  | "call:created"
  | "call:updated"
  | "appointment:created"
  | "appointment:updated"
  | "appointment:deleted";

export interface AuditMeta {
  [key: string]: unknown;
}

export async function logAudit(
  action: AuditAction,
  actorId: string,
  orgId: string,
  target?: string,
) {
  try {
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    await prisma.auditLog.create({
      data: {
        action,
        actorId,
        orgId,
        target,
        ip,
        userAgent,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    // Log audit failures but don't throw to avoid breaking main functionality
    console.error("Failed to log audit event:", error);
  }
}

export async function getAuditLogs(
  orgId: string,
  limit: number = 50,
  offset: number = 0,
) {
  return await prisma.auditLog.findMany({
    where: { orgId },
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });
}
