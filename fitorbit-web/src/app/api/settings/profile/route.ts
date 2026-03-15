import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fitorbit-super-secret-key-change-me-in-prod";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("fitorbit_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { gymId: string, userId: string };

    const gym = await prisma.gym.findUnique({
      where: { id: decoded.gymId },
    });

    if (!gym) {
      return NextResponse.json({ message: "Gym not found" }, { status: 404 });
    }

    return NextResponse.json({ gym });
  } catch (error) {
    console.error("Fetch Settings Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("fitorbit_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { gymId: string, userId: string };

    const body = await req.json();
    const { name, ownerName, location, currency, timezone } = body;

    const updatedGym = await prisma.gym.update({
      where: { id: decoded.gymId },
      data: {
        name,
        ownerName,
        location,
        currency,
        timezone
      }
    });

    return NextResponse.json({ message: "Settings updated successfully", gym: updatedGym });
  } catch (error) {
    console.error("Update Settings Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
