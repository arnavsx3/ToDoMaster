import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

interface RouteContext {
  params: Promise<{id: string}>;
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { completed } = await req.json();
    const {id:todoId} = await params;

    const todo = await prisma.todo.findUnique({
      where: { id: todoId },
    });
    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }
    if (todo.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedTodo = await prisma.todo.update({
      where: { id: todoId },
      data: { completed },
    });

    return NextResponse.json({ updatedTodo }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: todoID } = await params;
    const todo = await prisma.todo.findUnique({
      where: { id: todoID },
    });
    if (!todo) {
      return NextResponse.json({ message: "Todo not found" }, { status: 404 });
    }

    if (todo.userId !== userId) {
      return NextResponse.json(
        { message: "User not authorized to delete this todo" },
        { status: 401 },
      );
    }

    await prisma.todo.delete({
      where: { id: todoID },
    });

    return NextResponse.json(
      { message: "Todo deleted successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
