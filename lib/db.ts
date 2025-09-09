import mongoose from "mongoose"

// Интерфейс для подключения
interface Connection {
  isConnected?: number
}

const connection: Connection = {}

export const connectDB = async (): Promise<void> => {
  try {
    // Проверяем существующее подключение
    if (connection.isConnected) {
      console.log("✅ Используется существующее подключение к MongoDB")
      return
    }

    // Проверяем переменную окружения
    if (!process.env.MONGODB_URI) {
      throw new Error("❌ MONGODB_URI не установлена в переменных окружения")
    }

    // Настройки подключения для оптимальной производительности
    const options = {
      bufferCommands: false,
      maxPoolSize: 10, // Максимум 10 подключений в пуле
      serverSelectionTimeoutMS: 5000, // Таймаут выбора сервера
      socketTimeoutMS: 45000, // Таймаут сокета
      family: 4, // Использовать IPv4
      retryWrites: true,
      w: "majority",
    }

    console.log("🔄 Подключение к MongoDB...")
    const db = await mongoose.connect(process.env.MONGODB_URI, options)

    connection.isConnected = db.connections[0].readyState

    console.log("✅ MongoDB подключена успешно")
    console.log(`📊 База данных: ${db.connections[0].name}`)
    console.log(`🌐 Хост: ${db.connections[0].host}:${db.connections[0].port}`)

    // Обработчики событий для мониторинга
    mongoose.connection.on("connected", () => {
      console.log("🟢 MongoDB подключена")
    })

    mongoose.connection.on("error", (err) => {
      console.error("🔴 Ошибка MongoDB:", err)
    })

    mongoose.connection.on("disconnected", () => {
      console.log("🟡 MongoDB отключена")
      connection.isConnected = 0
    })

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close()
      console.log("🔴 MongoDB подключение закрыто через app termination")
      process.exit(0)
    })
  } catch (error) {
    console.error("❌ Ошибка подключения к MongoDB:", error)

    // Детальная информация об ошибке
    if (error instanceof Error) {
      console.error("📝 Сообщение:", error.message)
      console.error("📍 Stack:", error.stack)
    }

    throw new Error("Не удалось подключиться к базе данных")
  }
}

// Функция для проверки состояния подключения
export const getConnectionStatus = (): string => {
  const state = mongoose.connection.readyState
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  }
  return states[state as keyof typeof states] || "unknown"
}

// Функция для получения статистики БД
export const getDatabaseStats = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error("База данных не подключена")
    }

    const stats = await mongoose.connection.db.stats()
    return {
      collections: stats.collections,
      dataSize: Math.round((stats.dataSize / 1024 / 1024) * 100) / 100, // MB
      indexSize: Math.round((stats.indexSize / 1024 / 1024) * 100) / 100, // MB
      objects: stats.objects,
    }
  } catch (error) {
    console.error("Ошибка получения статистики БД:", error)
    return null
  }
}
