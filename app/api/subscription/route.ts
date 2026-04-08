import { NextRequest, NextResponse } from "next/server";
import { useAuth } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = useAuth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const subscriptionEnds = new Date();
    subscriptionEnds.setMonth(subscriptionEnds.getMonth() + 1);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isSubscribed: true,
        subscriptionEnds: subscriptionEnds,
      },
    });

    return NextResponse.json(
      {
        message: "User subscribed successfully",
        subscriptionEnds: updatedUser.subscriptionEnds,
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = useAuth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isSubscribed: true, subscriptionEnds: true },
    });
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    if (user.subscriptionEnds && user.subscriptionEnds < now) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isSubscribed: false,
          subscriptionEnds: null,
        },
      });
      return NextResponse.json(
        { isSubscribed: false, subscriptionEnds: null },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        isSubscribed: user.isSubscribed,
        subscriptionEnds: user.subscriptionEnds,
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
