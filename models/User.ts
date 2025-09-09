import { Schema, models, model } from "mongoose"

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    // Пользовательские настройки
    notificationFrequency: {
      type: Number,
      default: 60, // в минутах
      min: 1,
      max: 1440,
    },
    notificationLeadTime: {
      type: Number,
      default: 5, // в днях
      min: 0,
      max: 365,
    },
    enableRepeatingNotifications: {
      type: Boolean,
      default: true,
    },
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
    },
    language: {
      type: String,
      enum: ["ru", "en"],
      default: "ru",
    },
    notificationSound: {
      type: String,
      default: "default",
    },
    // Настройки тегов
    customTags: [
      {
        name: String,
        color: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    // Статистика использования
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    recordsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Индексы для оптимизации
userSchema.index({ email: 1 })
userSchema.index({ lastLogin: -1 })

const User = models.User || model("User", userSchema)

export default User
