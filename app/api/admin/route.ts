import { NextRequest, NextResponse } from "next/server";
import { useAuth } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";

async function isAdmin(userId: string) {
  const proxyClient = await clerkClient();
  const user = await proxyClient.users.getUser(userId);
  return user.publicMetadata.role === "admin";
}
