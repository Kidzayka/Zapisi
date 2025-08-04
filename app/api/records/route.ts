import { NextResponse } from "next/server"
import mongoose from "mongoose"

// Определяем схему для записи
const recordSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ["active", "pending", "completed"], default: "active" },
  category: { type: String, required: true },
  date: { type: Date, required: true },
  participants: { type: [String], default: [] },
  // Добавляем поля из вашего примера данных
  name: { type: String },
  phone: { type: String },
  email: { type: String },
  preferredDate: { type: Date },
  preferredTime: { type: String },
  createdAt: { type: Date, default: Date.now },
})

// Создаем модель, если она еще не существует
const Record = mongoose.models.Record || mongoose.model("Record", recordSchema)

let isConnected = false

const connectDB = async () => {
  if (isConnected) {
    console.log("Используется существующее подключение к базе данных.")
    return
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("Переменная окружения MONGODB_URI не установлена.")
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "records_db", // Вы можете изменить имя вашей базы данных здесь
    })
    isConnected = true
    console.log("MongoDB подключена.")
  } catch (error) {
    console.error("Ошибка подключения к MongoDB:", error)
    throw new Error("Не удалось подключиться к базе данных.")
  }
}

export async function GET(request: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const category = searchParams.get("category") || ""
    const sortBy = searchParams.get("sortBy") || "date"
    const sortOrder = searchParams.get("sortOrder") || "asc"

    const query: any = {}
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } }, // Добавляем поиск по имени
        { email: { $regex: search, $options: "i" } }, // Добавляем поиск по email
      ]
    }
    if (status && status !== "all") {
      query.status = status
    }
    if (category && category !== "all") {
      query.category = category
    }

    const sortOptions: any = {}
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1

    const records = await Record.find(query).sort(sortOptions)

    return NextResponse.json(records)
  } catch (error) {
    console.error("Ошибка при получении записей:", error)
    return NextResponse.json({ message: "Ошибка сервера" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await connectDB()
    const newRecordData = await request.json()

    // Преобразуем preferredDate и preferredTime в одно поле date, если они есть
    if (newRecordData.preferredDate && newRecordData.preferredTime) {
      const datePart = newRecordData.preferredDate.split("T")[0] // "2025-08-07"
      const timePart = newRecordData.preferredTime // "17:00"
      newRecordData.date = new Date(`${datePart}T${timePart}:00Z`)
      delete newRecordData.preferredDate
      delete newRecordData.preferredTime
    } else if (newRecordData.date) {
      // Если date уже в правильном формате, используем его
      newRecordData.date = new Date(newRecordData.date)
    }

    // Если title не предоставлен, используем name
    if (!newRecordData.title && newRecordData.name) {
      newRecordData.title = `Запись для ${newRecordData.name}`
    }

    // Если description не предоставлен, формируем его из phone и email
    if (!newRecordData.description) {
      const desc = []
      if (newRecordData.phone) desc.push(`Телефон: ${newRecordData.phone}`)
      if (newRecordData.email) desc.push(`Email: ${newRecordData.email}`)
      newRecordData.description = desc.join(", ")
    }

    // Если participants не предоставлены, используем name
    if (!newRecordData.participants || newRecordData.participants.length === 0) {
      if (newRecordData.name) {
        newRecordData.participants = [newRecordData.name]
      }
    }

    const newRecord = await Record.create(newRecordData)
    return NextResponse.json(newRecord, { status: 201 })
  } catch (error) {
    console.error("Ошибка при добавлении записи:", error)
    return NextResponse.json({ message: "Ошибка сервера" }, { status: 500 })
  }
}
