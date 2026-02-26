import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { email, password, name, phone, company } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        const exists = await prisma.user.findUnique({
            where: { email }
        });

        if (exists) {
            return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                email,
                hashedPassword,
                name,
                phone,
                company,
                role: "CUSTOMER", // explicit fallback safety
            }
        });

        return NextResponse.json({ success: true, user: { id: newUser.id, email: newUser.email, name: newUser.name } });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Registration failed" }, { status: 500 });
    }
}
