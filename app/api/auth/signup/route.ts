import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import User from "@/models/User"
import { connectDB } from "@/lib/db"

export async function POST(request: Request) {
  try {
    await connectDB()
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Все поля обязательны." }, { status: 400 })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: "Пользователь с таким email уже существует." }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await User.create({ name, email, password: hashedPassword })

    return NextResponse.json({ message: "Пользователь успешно зарегистрирован." }, { status: 201 })
  } catch (error) {
    console.error("Ошибка регистрации пользователя:", error)
    return NextResponse.json({ message: "Ошибка сервера при регистрации." }, { status: 500 })
  }
}
