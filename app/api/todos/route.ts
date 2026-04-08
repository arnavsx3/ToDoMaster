import { NextRequest, NextResponse } from "next/server";
import { useAuth } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";

const ITEMS_PER_PAGE = 10;

export async function GET(req: NextRequest) {
    try {
        
    } catch (error:any) {
        return NextResponse.json(
          { message: "Internal server error" },
          { status: 500 },
        );
    }
}
