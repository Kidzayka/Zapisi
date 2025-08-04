"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
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

interface DayViewProps {
  records: Record[]
  onEdit: (record: Record) => void
}

export function DayView({ records, onEdit }: DayViewProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todaysEvents = records
    .filter((record) => {
      const recordDate = new Date(record.date)
      recordDate.setHours(0, 0, 0, 0)
      return recordDate.getTime() === today.getTime()
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>События на сегодня ({new Date().toLocaleDateString("ru-RU")})</CardTitle>
      </CardHeader>
      <CardContent>
        {todaysEvents.length === 0 ? (
          <p className="text-gray-500">На сегодня нет запланированных событий.</p>
        ) : (
          <div className="space-y-4">
            {todaysEvents.map((record) => (
              <div
                key={record._id}
                className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0"
              >
                <div>
                  <h3 className="font-semibold text-lg">{record.title || record.name || "Событие"}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(record.date).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {record.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  {record.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">{record.description}</p>
                  )}
                  {record.phone && <p className="text-xs text-gray-500 dark:text-gray-300">Телефон: {record.phone}</p>}
                  {record.email && <p className="text-xs text-gray-500 dark:text-gray-300">Email: {record.email}</p>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => onEdit(record)}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Редактировать</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
