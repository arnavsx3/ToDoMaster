import { NextRequest, NextResponse } from "next/server";
import { useAuth } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";

const ITEMS_PER_PAGE = 10;

export async function GET(req: NextRequest) {
  try {
    const { userId } = useAuth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";

    const todos = await prisma.todo.findMany({
      where: {
        userId: userId,
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
    });

    const totalItems = await prisma.todo.count({
      where: {
        userId: userId,
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
    });

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    return NextResponse.json(
      { todos, currentPage: page, totalPages },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = useAuth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { todos: true },
    });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!user.isSubscribed && user.todos.length >= 3) {
      return NextResponse.json(
        {
          message: "Max todo limit reached, subscribe to add more todos.",
        },
        { status: 403 },
      );
    }

    const { title } = await req.json();
    const todo = await prisma.todo.create({
      data: {
        userId,
        title,
      },
    });

    return NextResponse.json(
      { message: "Todo created successfully", todo },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
