import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nombre, email y contraseña son obligatorios" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "El correo electrónico ya está registrado" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "doctor",
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;

    const response = NextResponse.json({
      message: "Usuario registrado con éxito",
      user: userWithoutPassword,
    }, { status: 201 });

    response.cookies.set({
      name: "hospital_user",
      value: JSON.stringify(userWithoutPassword),
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Error al registrar usuario" }, { status: 500 });
  }
}
