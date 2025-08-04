"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RecordsTable } from "@/components/records-table"
import { LessonFormDialog } from "@/components/lesson-form-dialog"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, PlusCircle } from "lucide-react"

// Определение типа Record для более строгой типизации
interface Record {
  _id: string
  title?: string // Теперь может быть опциональным, если формируется на лету
  description?: string // Теперь может быть опциональным
  status: string
  category: string
  date: string
  participants?: string[] // Теперь может быть опциональным
  name?: string
  phone?: string
  email?: string
  preferredDate?: string // Добавлено
  preferredTime?: string // Добавлено
  createdAt?: string
}

export default function RecordsDashboard() {
  const [records, setRecords] = useState<Record[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState("asc")
  const [loading, setLoading] = useState(true)
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Record | null>(null)
  const { toast } = useToast()

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        status: statusFilter,
        category: categoryFilter,
        sortBy: sortBy,
        sortOrder: sortOrder,
      }).toString()
      const response = await fetch(`/api/records?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch records")
      }
      const data = await response.json()
      setRecords(data)
    } catch (error) {
      console.error("Error fetching records:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить записи.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [searchQuery, statusFilter, categoryFilter, sortBy, sortOrder, toast])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  // --- Функции для добавления/редактирования ---
  const handleOpenAddDialog = () => {
    setEditingRecord(null) // Сбросить редактируемую запись
    setIsFormDialogOpen(true)
  }

  const handleOpenEditDialog = (record: Record) => {
    setEditingRecord(record)
    setIsFormDialogOpen(true)
  }

  const handleFormSubmit = async (data: any, id?: string) => {
    try {
      let response
      if (id) {
        // Редактирование
        response = await fetch("/api/records", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ _id: id, ...data }),
        })
      } else {
        // Добавление
        response = await fetch("/api/records", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
      }

      if (!response.ok) {
        throw new Error(id ? "Failed to update record" : "Failed to add record")
      }

      await fetchRecords() // Перезагрузить данные после изменения
      toast({
        title: "Успех!",
        description: id ? "Запись успешно обновлена." : "Занятие успешно добавлено.",
      })
      setIsFormDialogOpen(false)
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Ошибка",
        description: id ? "Не удалось обновить запись." : "Не удалось добавить занятие.",
        variant: "destructive",
      })
    }
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setCategoryFilter("all")
    setSortBy("date")
    setSortOrder("asc")
  }

  // --- Функции для уведомлений ---
  const requestNotificationPermission = useCallback(() => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Разрешение на уведомления получено.")
        } else {
          console.warn("Разрешение на уведомления отклонено.")
        }
      })
    }
  }, [])

  const checkAndSendNotifications = useCallback(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return // Уведомления не поддерживаются или разрешение не дано
    }

    const notifiedEvents = JSON.parse(localStorage.getItem("notifiedEvents") || "[]")
    const now = new Date()
    const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000)

    records.forEach((record) => {
      const eventDate = new Date(record.date)
      // Проверяем, что событие активно, еще не завершено, и находится в пределах 5 дней
      if (
        record.status === "active" &&
        eventDate > now &&
        eventDate <= fiveDaysFromNow &&
        !notifiedEvents.includes(record._id)
      ) {
        new Notification(`Предстоящее событие: ${record.title || record.name || "Событие"}`, {
          body: `Начнется ${new Date(record.date).toLocaleString()} (${record.category}).`,
          icon: "/placeholder.svg?height=64&width=64", // Иконка для уведомления
        })
        notifiedEvents.push(record._id)
      }
    })
    localStorage.setItem("notifiedEvents", JSON.stringify(notifiedEvents))
  }, [records])

  useEffect(() => {
    requestNotificationPermission()
    // Проверяем уведомления при загрузке данных и затем каждые 5 минут
    checkAndSendNotifications()
    const interval = setInterval(checkAndSendNotifications, 5 * 60 * 1000) // Каждые 5 минут
    return () => clearInterval(interval)
  }, [requestNotificationPermission, checkAndSendNotifications])

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Управление Записями</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <Input
          placeholder="Поиск по названию, описанию, имени или email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Фильтр по статусу" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="active">Активные</SelectItem>
            <SelectItem value="pending">Ожидающие</SelectItem>
            <SelectItem value="completed">Завершенные</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Фильтр по категории" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            <SelectItem value="Lecture">Лекция</SelectItem>
            <SelectItem value="Workshop">Практикум</SelectItem>
            <SelectItem value="Meeting">Встреча</SelectItem>
            <SelectItem value="Appointment">Запись</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleClearFilters} variant="outline">
          Сбросить фильтры
        </Button>
        <Button onClick={handleOpenAddDialog} className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          Запланировать занятие
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Загрузка данных...</span>
        </div>
      ) : (
        <RecordsTable
          records={records}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          onEdit={handleOpenEditDialog}
        />
      )}

      <LessonFormDialog
        isOpen={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        onSubmit={handleFormSubmit}
        initialData={editingRecord}
      />
    </div>
  )
}
