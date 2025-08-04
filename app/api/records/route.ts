import { NextResponse } from "next/server"

// Имитация данных из MongoDB
// В реальном приложении здесь будет подключение к вашей MongoDB
// Например, с использованием mongoose:
// import mongoose from 'mongoose';
// import Record from '@/models/Record'; // Ваш Mongoose-модель

const mockRecords = [
  {
    _id: "rec1",
    title: "Урок по React.js",
    description: "Введение в основы React и JSX.",
    status: "active",
    category: "Lecture",
    date: "2025-08-10T10:00:00Z",
    participants: ["Иван", "Мария"],
  },
  {
    _id: "rec2",
    title: "Практикум по Node.js",
    description: "Создание REST API с Express.",
    status: "active",
    category: "Workshop",
    date: "2025-08-12T14:30:00Z",
    participants: ["Петр", "Анна", "Сергей"],
  },
  {
    _id: "rec3",
    title: 'Встреча по проекту "Vercel"',
    description: "Обсуждение прогресса и следующих шагов.",
    status: "pending",
    category: "Meeting",
    date: "2025-08-15T09:00:00Z",
    participants: ["Елена", "Дмитрий"],
  },
  {
    _id: "rec4",
    title: "Семинар по Tailwind CSS",
    description: "Быстрая разработка UI с Tailwind.",
    status: "completed",
    category: "Lecture",
    date: "2025-08-05T11:00:00Z",
    participants: ["Ольга", "Николай"],
  },
  {
    _id: "rec5",
    title: "Консультация по Next.js",
    description: "Вопросы и ответы по App Router.",
    status: "active",
    category: "Meeting",
    date: "2025-08-18T16:00:00Z",
    participants: ["Алексей"],
  },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search") || ""
  const status = searchParams.get("status") || ""
  const category = searchParams.get("category") || ""
  const sortBy = searchParams.get("sortBy") || "date"
  const sortOrder = searchParams.get("sortOrder") || "asc"

  const filteredRecords = mockRecords.filter((record) => {
    const matchesSearch = search
      ? record.title.toLowerCase().includes(search.toLowerCase()) ||
        record.description.toLowerCase().includes(search.toLowerCase())
      : true
    const matchesStatus = status ? record.status === status : true
    const matchesCategory = category ? record.category === category : true
    return matchesSearch && matchesStatus && matchesCategory
  })

  filteredRecords.sort((a, b) => {
    let valA: string | number = ""
    let valB: string | number = ""

    if (sortBy === "date") {
      valA = new Date(a.date).getTime()
      valB = new Date(b.date).getTime()
    } else if (sortBy === "title") {
      valA = a.title.toLowerCase()
      valB = b.title.toLowerCase()
    } else if (sortBy === "status") {
      valA = a.status.toLowerCase()
      valB = b.status.toLowerCase()
    } else if (sortBy === "category") {
      valA = a.category.toLowerCase()
      valB = b.category.toLowerCase()
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1
    if (valA > valB) return sortOrder === "asc" ? 1 : -1
    return 0
  })

  return NextResponse.json(filteredRecords)
}

export async function POST(request: Request) {
  const newRecord = await request.json()
  newRecord._id = `rec${mockRecords.length + 1}` // Простой ID для имитации
  mockRecords.push(newRecord)
  return NextResponse.json(newRecord, { status: 201 })
}

// В реальном приложении, для подключения к MongoDB:
/*
// Пример подключения к MongoDB с Mongoose
let isConnected = false;
const connectDB = async () => {
  if (isConnected) {
    console.log('Using existing database connection');
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      dbName: 'your_database_name', // Замените на имя вашей БД
    });
    isConnected = true;
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Пример использования в GET
export async function GET(request: Request) {
  await connectDB();
  // const records = await Record.find({}); // Получение данных из реальной БД
  // return NextResponse.json(records);
}

// Пример использования в POST
export async function POST(request: Request) {
  await connectDB();
  const newRecordData = await request.json();
  // const newRecord = await Record.create(newRecordData); // Сохранение в реальную БД
  // return NextResponse.json(newRecord, { status: 201 });
}
*/
