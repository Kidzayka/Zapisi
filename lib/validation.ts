import { z } from "zod"

// Схемы валидации для форм
export const recordSchema = z.object({
  name: z.string().min(1, "Имя обязательно для заполнения"),
  phone: z.string().optional(),
  email: z.string().email("Некорректный email").optional().or(z.literal("")),
  preferredDate: z.string().min(1, "Дата обязательна"),
  preferredTime: z.string().min(1, "Время обязательно"),
  title: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(["active", "pending", "completed"]).default("active"),
  participants: z.array(z.string()).default([]),
})

export const userSettingsSchema = z.object({
  notificationFrequency: z.number().min(1).max(1440),
  notificationLeadTime: z.number().min(0).max(365),
  enableRepeatingNotifications: z.boolean(),
  theme: z.enum(["light", "dark"]),
  language: z.enum(["ru", "en"]),
  notificationSound: z.string(),
})

export type RecordFormData = z.infer<typeof recordSchema>
export type UserSettingsData = z.infer<typeof userSettingsSchema>
