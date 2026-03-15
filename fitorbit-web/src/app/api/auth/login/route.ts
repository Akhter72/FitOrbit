import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fitorbit-super-secret-key-change-me-in-prod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Missing email or password" },
        { status: 400 }
      );
    }

    // 1. Find User
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        gym: true, // Fetch gym details to return to frontend
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 2. Verify Password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 3. Generate JWT Token
    // We embed the user's role and their specific Gym ID into the token payload
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      gymId: user.gymId,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: "7d", // Token valid for 7 days
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // 4. Return success with token (optionally you could set this as an HTTP-only cookie here)
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: userWithoutPassword,
        token: token,
      },
      { status: 200 }
    );

    // Example of setting HTTP-only cookie for enhanced security:
    // response.cookies.set({
    //   name: "fitorbit_token",
    //   value: token,
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "strict",
    //   maxAge: 60 * 60 * 24 * 7, // 7 days
    //   path: "/",
    // });

    return response;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
