import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";

async function isAdmin(userId: string) {
  const proxyClient = await clerkClient();
  const user = await proxyClient.users.getUser(userId);
  return user.publicMetadata?.role === "admin";
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const isUserAdmin = await isAdmin(userId);
    if (!isUserAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      include: {
        _count: { select: { todos: true } },
      },
      orderBy: { id: "asc" },
    });

    const totalUsers = await prisma.user.count();
    const totalPro = await prisma.user.count({
      where: { isSubscribed: true },
    });
    const totalTodos = await prisma.todo.count();

    return NextResponse.json(
      { users, totalUsers, totalPro, totalTodos },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
