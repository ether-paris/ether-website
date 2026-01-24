"use server";

import { logVisitor } from "@/lib/db";
import { headers } from "next/headers";

export async function logVisit(pathname: string) {
  try {
    const headersList = await headers();
    // x-forwarded-for can be a list of IPs, we take the first one (client IP)
    const forwardedFor = headersList.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    // We don't await this to avoid blocking the response
    // validation is handled in db.ts
    logVisitor(ip, userAgent, pathname);
  } catch (error) {
    console.error("Error logging visit:", error);
  }
}
