import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, gymName } = body;

    if (!email || !password || !firstName || !lastName || !gymName) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create Gym & Admin User inside a Transaction
    // Ensure both are created together or neither is
    const result = await prisma.$transaction(async (tx: any) => {
      // Create the Gym profile first
      const newGym = await tx.gym.create({
        data: {
          name: gymName,
          ownerName: `${firstName} ${lastName}`,
        },
      });

      // Create the Admin User tied to the Gym
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: "ADMIN",
          gymId: newGym.id,
        },
      });

      return { user: newUser, gym: newGym };
    });

    // Remove password from response for security
    const { password: _, ...userWithoutPassword } = result.user;

    return NextResponse.json(
      {
        message: "Gym and Admin account created successfully!",
        user: userWithoutPassword,
        gym: result.gym,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
