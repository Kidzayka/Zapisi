"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge" // Импортируем Badge

interface Record {
  _id: string
  title?: string
  description?: string
  status: string
  tags: string[] // <-- Изменено: теперь массив тегов
  date: string
  participants?: string[]
  name?: string
  phone?: string
  email?: string
}

interface CalendarViewProps {
  records: Record[]
  onEdit: (record: Record) => void
}

export function CalendarView({ records, onEdit }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDayEvents, setSelectedDayEvents] = useState<Record[]>([])
  const [isDayEventsDialogOpen, setIsDayEventsDialogOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const numDays = lastDayOfMonth.getDate()

    const startDayOfWeek = firstDayOfMonth.getDay() // 0 for Sunday, 1 for Monday
    const offset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1 // Adjust to start Monday as 0

    const days = []
    // Add leading empty days
    for (let i = 0; i < offset; i++) {
      days.push(null)
    }
    // Add actual days of the month
    for (let i = 1; i <= numDays; i++) {
      days.push(new Date(year, month, i))
    }
    // Add trailing empty days to fill the last week
    while (days.length % 7 !== 0) {
      days.push(null)
    }
    return days
  }, [currentMonth])

  const eventsByDay = useMemo(() => {
    const eventsMap = new Map<string, Record[]>() // Key: YYYY-MM-DD
    records.forEach((record) => {
      const recordDate = new Date(record.date)
      const dateKey = recordDate.toISOString().split("T")[0]
      if (!eventsMap.has(dateKey)) {
        eventsMap.set(dateKey, [])
      }
      eventsMap.get(dateKey)?.push(record)
    })
    return eventsMap
  }, [records])

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const handleDayClick = (day: Date | null) => {
    if (day) {
      setSelectedDay(day)
      const dateKey = day.toISOString().split("T")[0]
      const events = eventsByDay.get(dateKey) || []
      setSelectedDayEvents(events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
      setIsDayEventsDialogOpen(true)
    }
  }

  const today = new Date()
  const isToday = (day: Date) =>
    day.getDate() === today.getDate() &&
    day.getMonth() === today.getMonth() &&
    day.getFullYear() === today.getFullYear()

  const isSelectedDay = (day: Date) =>
    selectedDay &&
    day.getDate() === selectedDay.getDate() &&
    day.getMonth() === selectedDay.getMonth() &&
    day.getFullYear() === selectedDay.getFullYear()

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <CardTitle className="text-xl font-semibold">
          {currentMonth.toLocaleString("ru-RU", { month: "long", year: "numeric" })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={handleNextMonth}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
          {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
            <div key={day} className="py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-sm">
          {daysInMonth.map((day, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`relative flex h-20 flex-col items-center justify-start p-1 text-left align-top ${
                day ? "cursor-pointer" : "cursor-default opacity-50"
              } ${isToday(day as Date) ? "bg-blue-100 dark:bg-blue-900" : ""} ${
                isSelectedDay(day as Date) ? "ring-2 ring-blue-500 dark:ring-blue-400" : ""
              }`}
              disabled={!day}
              onClick={() => handleDayClick(day)}
            >
              {day && (
                <>
                  <span className="text-right w-full text-xs font-semibold">{day.getDate()}</span>
                  <div className="flex flex-col gap-0.5 mt-1 w-full overflow-hidden">
                    {eventsByDay.get(day.toISOString().split("T")[0])?.map((event) => (
                      <span
                        key={event._id}
                        className="text-[0.6rem] leading-tight truncate px-1 py-0.5 rounded-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      >
                        {event.title || event.name}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </Button>
          ))}
        </div>
      </CardContent>

      {/* Диалог событий дня */}
      <Dialog open={isDayEventsDialogOpen} onOpenChange={setIsDayEventsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              События на {selectedDay?.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 max-h-[400px] overflow-y-auto">
            {selectedDayEvents.length === 0 ? (
              <p className="text-gray-500">На этот день нет событий.</p>
            ) : (
              <div className="space-y-3">
                {selectedDayEvents.map((event) => (
                  <Card key={event._id} className="p-3">
                    <h3 className="font-semibold text-lg">{event.title || event.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(event.date).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {event.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    {event.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">{event.description}</p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 bg-transparent"
                      onClick={() => {
                        onEdit(event)
                        setIsDayEventsDialogOpen(false)
                      }}
                    >
                      Редактировать
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
