import { startOfWeek, endOfWeek, startOfMonth, eachDayOfInterval, format, isSameDay, getHours } from "date-fns"

export interface WorkloadData {
  date: string
  totalSessions: number
  duration: number // в минутах
  intensity: "low" | "medium" | "high" | "overload"
  sessions: Array<{
    id: string
    time: string
    duration: number
    type: string
    participants: number
  }>
}

export interface WorkloadAnalytics {
  dailyWorkload: WorkloadData[]
  weeklyStats: {
    totalHours: number
    averageSessionsPerDay: number
    peakDay: string
    lightestDay: string
    utilization: number // процент загруженности
  }
  hourlyDistribution: Array<{
    hour: number
    sessions: number
    label: string
  }>
  monthlyTrends: Array<{
    week: string
    hours: number
    sessions: number
  }>
  capacityAnalysis: {
    maxCapacity: number
    currentLoad: number
    recommendedCapacity: number
    overloadDays: string[]
  }
}

export class WorkloadAnalyzer {
  private records: any[]
  private workingHoursStart = 9
  private workingHoursEnd = 18
  private maxSessionsPerDay = 8
  private defaultSessionDuration = 60 // минут

  constructor(records: any[]) {
    this.records = records
  }

  analyzeWorkload(startDate: Date = startOfWeek(new Date()), endDate: Date = endOfWeek(new Date())): WorkloadAnalytics {
    const days = eachDayOfInterval({ start: startDate, end: endDate })

    const dailyWorkload = days.map((day) => this.analyzeDailyWorkload(day))
    const weeklyStats = this.calculateWeeklyStats(dailyWorkload)
    const hourlyDistribution = this.analyzeHourlyDistribution()
    const monthlyTrends = this.analyzeMonthlyTrends()
    const capacityAnalysis = this.analyzeCapacity(dailyWorkload)

    return {
      dailyWorkload,
      weeklyStats,
      hourlyDistribution,
      monthlyTrends,
      capacityAnalysis,
    }
  }

  private analyzeDailyWorkload(date: Date): WorkloadData {
    const dayRecords = this.records.filter(
      (record) => isSameDay(new Date(record.date), date) && record.status === "active",
    )

    const sessions = dayRecords.map((record) => ({
      id: record._id,
      time: format(new Date(record.date), "HH:mm"),
      duration: this.getSessionDuration(record),
      type: record.tags?.[0] || "general",
      participants: record.participants?.length || 1,
    }))

    const totalSessions = sessions.length
    const duration = sessions.reduce((sum, session) => sum + session.duration, 0)

    let intensity: WorkloadData["intensity"] = "low"
    if (totalSessions >= this.maxSessionsPerDay * 0.8) intensity = "overload"
    else if (totalSessions >= this.maxSessionsPerDay * 0.6) intensity = "high"
    else if (totalSessions >= this.maxSessionsPerDay * 0.3) intensity = "medium"

    return {
      date: format(date, "yyyy-MM-dd"),
      totalSessions,
      duration,
      intensity,
      sessions,
    }
  }

  private calculateWeeklyStats(dailyWorkload: WorkloadData[]) {
    const totalHours = dailyWorkload.reduce((sum, day) => sum + day.duration / 60, 0)
    const totalSessions = dailyWorkload.reduce((sum, day) => sum + day.totalSessions, 0)
    const averageSessionsPerDay = totalSessions / dailyWorkload.length

    const peakDay = dailyWorkload.reduce((max, day) => (day.totalSessions > max.totalSessions ? day : max))

    const lightestDay = dailyWorkload.reduce((min, day) => (day.totalSessions < min.totalSessions ? day : min))

    const maxPossibleHours = dailyWorkload.length * (this.workingHoursEnd - this.workingHoursStart)
    const utilization = (totalHours / maxPossibleHours) * 100

    return {
      totalHours: Math.round(totalHours * 10) / 10,
      averageSessionsPerDay: Math.round(averageSessionsPerDay * 10) / 10,
      peakDay: format(new Date(peakDay.date), "EEEE"),
      lightestDay: format(new Date(lightestDay.date), "EEEE"),
      utilization: Math.round(utilization * 10) / 10,
    }
  }

  private analyzeHourlyDistribution() {
    const hourCounts = new Array(24).fill(0)

    this.records
      .filter((record) => record.status === "active")
      .forEach((record) => {
        const hour = getHours(new Date(record.date))
        hourCounts[hour]++
      })

    return hourCounts
      .map((sessions, hour) => ({
        hour,
        sessions,
        label: `${hour}:00`,
      }))
      .filter((item) => item.hour >= this.workingHoursStart && item.hour < this.workingHoursEnd)
  }

  private analyzeMonthlyTrends() {
    const startDate = startOfMonth(new Date())
    const weeks = []
    let currentWeekStart = startOfWeek(startDate)

    for (let i = 0; i < 4; i++) {
      const weekEnd = endOfWeek(currentWeekStart)
      const weekRecords = this.records.filter((record) => {
        const recordDate = new Date(record.date)
        return recordDate >= currentWeekStart && recordDate <= weekEnd && record.status === "active"
      })

      const hours = weekRecords.reduce((sum, record) => sum + this.getSessionDuration(record) / 60, 0)

      weeks.push({
        week: `Неделя ${i + 1}`,
        hours: Math.round(hours * 10) / 10,
        sessions: weekRecords.length,
      })

      currentWeekStart = new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
    }

    return weeks
  }

  private analyzeCapacity(dailyWorkload: WorkloadData[]) {
    const maxCapacity = this.maxSessionsPerDay * 7 // неделя
    const currentLoad = dailyWorkload.reduce((sum, day) => sum + day.totalSessions, 0)
    const recommendedCapacity = Math.floor(maxCapacity * 0.75) // 75% от максимума

    const overloadDays = dailyWorkload
      .filter((day) => day.intensity === "overload")
      .map((day) => format(new Date(day.date), "EEEE"))

    return {
      maxCapacity,
      currentLoad,
      recommendedCapacity,
      overloadDays,
    }
  }

  private getSessionDuration(record: any): number {
    // Пытаемся извлечь длительность из описания или используем по умолчанию
    if (record.description) {
      const durationMatch = record.description.match(/(\d+)\s*(мин|минут|hour|час)/i)
      if (durationMatch) {
        const value = Number.parseInt(durationMatch[1])
        const unit = durationMatch[2].toLowerCase()
        return unit.includes("час") ? value * 60 : value
      }
    }

    return this.defaultSessionDuration
  }

  updateRecords(records: any[]) {
    this.records = records
  }

  setWorkingHours(start: number, end: number) {
    this.workingHoursStart = start
    this.workingHoursEnd = end
  }

  setMaxSessions(max: number) {
    this.maxSessionsPerDay = max
  }
}
