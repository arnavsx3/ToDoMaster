import { NextResponse, NextRequest } from "next/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
      return NextResponse.json(
        { message: "No webhook secret found" },
        { status: 404 },
      );
    }

    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json(
        { error: "Missing svix headers" },
        { status: 400 },
      );
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;

    if (evt.type === "user.created") {
      const { email_addresses, primary_email_address_id } = evt.data;
      const primaryEmail = email_addresses.find((email) => {
        email.id === primary_email_address_id;
      });
      if (!primaryEmail) {
        return NextResponse.json(
          { message: "No email address found" },
          { status: 400 },
        );
      }
      const newUser = await prisma.user.create({
        data: {
          id: evt.data.id,
          email: primaryEmail.email_address,
          isSubscribed: false,
        },
      });

      return NextResponse.json(
        { message: "User created successfully", user: newUser },
        { status: 201 },
      );
    }

    return NextResponse.json({ message: "Event ignored" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
