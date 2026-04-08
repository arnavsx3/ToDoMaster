import { NextRequest, NextResponse } from "next/server";
import { useAuth } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";
import { useParams } from "next/navigation";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { userId } = useAuth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const todoID = params.id;
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
