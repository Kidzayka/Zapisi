import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from "date-fns"

interface Record {
  _id: string
  status: string
  date: string
  tags: string[]
  createdAt?: string
}

export interface AnalyticsData {
  totalRecords: number
  activeRecords: number
  pendingRecords: number
  completedRecords: number
  weeklyRecords: number
  monthlyRecords: number
  tagStats: { name: string; count: number; color: string }[]
  weeklyChart: { date: string; count: number }[]
  statusChart: { name: string; value: number; color: string }[]
  monthlyTrend: { month: string; count: number }[]
}

export function calculateAnalytics(records: Record[]): AnalyticsData {
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  // Основная статистика
  const totalRecords = records.length
  const activeRecords = records.filter((r) => r.status === "active").length
  const pendingRecords = records.filter((r) => r.status === "pending").length
  const completedRecords = records.filter((r) => r.status === "completed").length

  // Записи за неделю и месяц
  const weeklyRecords = records.filter((r) => {
    const recordDate = new Date(r.date)
    return recordDate >= weekStart && recordDate <= weekEnd
  }).length

  const monthlyRecords = records.filter((r) => {
    const recordDate = new Date(r.date)
    return recordDate >= monthStart && recordDate <= monthEnd
  }).length

  // Статистика по тегам
  const tagCounts: Record<string, number> = {}
  records.forEach((record) => {
    record.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
  })

  const tagStats = Object.entries(tagCounts)
    .map(([name, count], index) => ({
      name,
      count,
      color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // График по дням недели
  const weeklyChart = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + i)
    const dayRecords = records.filter((r) => {
      const recordDate = new Date(r.date)
      return recordDate.toDateString() === date.toDateString()
    }).length

    return {
      date: format(date, "EEE"),
      count: dayRecords,
    }
  })

  // График статусов
  const statusChart = [
    { name: "Активные", value: activeRecords, color: "#22c55e" },
    { name: "Ожидающие", value: pendingRecords, color: "#eab308" },
    { name: "Завершенные", value: completedRecords, color: "#6b7280" },
  ].filter((item) => item.value > 0)

  // Тренд по месяцам (последние 6 месяцев)
  const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthRecords = records.filter((r) => {
      const recordDate = new Date(r.date)
      return recordDate.getMonth() === date.getMonth() && recordDate.getFullYear() === date.getFullYear()
    }).length

    return {
      month: format(date, "MMM"),
      count: monthRecords,
    }
  }).reverse()

  return {
    totalRecords,
    activeRecords,
    pendingRecords,
    completedRecords,
    weeklyRecords,
    monthlyRecords,
    tagStats,
    weeklyChart,
    statusChart,
    monthlyTrend,
  }
}

export function exportToCSV(records: Record[], filename = "records.csv") {
  const headers = ["ID", "Название", "Статус", "Дата", "Теги", "Телефон", "Email"]
  const csvContent = [
    headers.join(","),
    ...records.map((record) =>
      [
        record._id,
        `"${(record as any).title || (record as any).name || ""}"`,
        record.status,
        new Date(record.date).toLocaleDateString(),
        `"${record.tags.join(", ")}"`,
        `"${(record as any).phone || ""}"`,
        `"${(record as any).email || ""}"`,
      ].join(","),
    ),
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportToJSON(records: Record[], filename = "records.json") {
  const jsonContent = JSON.stringify(records, null, 2)
  const blob = new Blob([jsonContent], { type: "application/json" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function generateICalendar(records: Record[]): string {
  const events = records
    .map((record) => {
      const startDate = new Date(record.date)
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // +1 час

      return [
        "BEGIN:VEVENT",
        `UID:${record._id}@records-dashboard.com`,
        `DTSTART:${startDate.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
        `DTEND:${endDate.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
        `SUMMARY:${(record as any).title || (record as any).name || "Событие"}`,
        `DESCRIPTION:${(record as any).description || ""}`,
        `STATUS:${record.status.toUpperCase()}`,
        "END:VEVENT",
      ].join("\r\n")
    })
    .join("\r\n")

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Records Dashboard//Records Dashboard//EN",
    events,
    "END:VCALENDAR",
  ].join("\r\n")
}
