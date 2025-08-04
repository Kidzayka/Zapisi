import { NextResponse } from "next/server"
import mongoose from "mongoose"

// Определяем схему для записи, привязанную к коллекции 'appointments'
const recordSchema = new mongoose.Schema(
  {
    // Поля, которые могут быть напрямую в коллекции appointments
    name: { type: String },
    phone: { type: String },
    email: { type: String },
    preferredDate: { type: Date }, // Дата из ваших данных
    preferredTime: { type: String }, // Время из ваших данных
    createdAt: { type: Date, default: Date.now },

    // Поля, которые используются в UI и могут быть сформированы из вышеуказанных
    title: { type: String }, // Будет формироваться из name
    description: { type: String }, // Будет формироваться из phone, email
    status: { type: String, enum: ["active", "pending", "completed"], default: "active" },
    category: { type: String, default: "Appointment" }, // По умолчанию "Appointment"
    date: { type: Date }, // Комбинированное поле для сортировки и отображения
    participants: { type: [String], default: [] }, // Будет формироваться из name
  },
  { collection: "appointments" },
) // <-- Ключевое изменение: привязка к коллекции 'appointments'

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
    // Mongoose по умолчанию подключится к базе данных 'test', если она не указана в URI
    await mongoose.connect(process.env.MONGODB_URI)
    isConnected = true
    console.log("MongoDB подключена.")
  } catch (error) {
    console.error("Ошибка подключения к MongoDB:", error)
    throw new Error("Не удалось подключиться к базе данных.")
  }
}

// Вспомогательная функция для обработки данных перед сохранением/обновлением
const processRecordData = (data: any) => {
  // Если preferredDate и preferredTime предоставлены, формируем поле date
  if (data.preferredDate && data.preferredTime) {
    const datePart = new Date(data.preferredDate).toISOString().split("T")[0] // "YYYY-MM-DD"
    const timePart = data.preferredTime // "HH:MM"
    data.date = new Date(`${datePart}T${timePart}:00Z`)
  } else if (data.date) {
    // Если date уже в правильном формате, используем его
    data.date = new Date(data.date)
  }

  // Если title не предоставлен, используем name
  if (!data.title && data.name) {
    data.title = `Запись для ${data.name}`
  } else if (!data.title && data.category === "Appointment") {
    data.title = "Новая запись" // Заголовок по умолчанию для Appointment
  }

  // Если description не предоставлен, формируем его из phone и email
  if (!data.description) {
    const desc = []
    if (data.phone) desc.push(`Телефон: ${data.phone}`)
    if (data.email) desc.push(`Email: ${data.email}`)
    data.description = desc.join(", ")
  }

  // Если participants не предоставлены, используем name
  if (!data.participants || data.participants.length === 0) {
    if (data.name) {
      data.participants = [data.name]
    }
  }

  // Устанавливаем категорию по умолчанию, если не указана
  if (!data.category) {
    data.category = "Appointment"
  }

  return data
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
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
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
    let newRecordData = await request.json()

    newRecordData = processRecordData(newRecordData)

    const newRecord = await Record.create(newRecordData)
    return NextResponse.json(newRecord, { status: 201 })
  } catch (error) {
    console.error("Ошибка при добавлении записи:", error)
    return NextResponse.json({ message: "Ошибка сервера" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB()
    const { _id, ...updateData } = await request.json()

    if (!_id) {
      return NextResponse.json({ message: "ID записи не предоставлен для обновления." }, { status: 400 })
    }

    const processedUpdateData = processRecordData(updateData)

    const updatedRecord = await Record.findByIdAndUpdate(_id, processedUpdateData, { new: true })

    if (!updatedRecord) {
      return NextResponse.json({ message: "Запись не найдена." }, { status: 404 })
    }

    return NextResponse.json(updatedRecord)
  } catch (error) {
    console.error("Ошибка при обновлении записи:", error)
    return NextResponse.json({ message: "Ошибка сервера" }, { status: 500 })
  }
}
