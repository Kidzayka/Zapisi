"use client"

import { useState, useEffect, useCallback, useMemo } from "react" // Добавлен useMemo
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RecordsTable } from "@/components/records-table"
import { LessonFormDialog } from "@/components/lesson-form-dialog"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, PlusCircle, Table, CalendarDays, Clock, BellOff } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CalendarView } from "@/components/calendar-view"
import { DayView } from "@/components/day-view"

// Определение типа Record для более строгой типизации
interface Record {
  _id: string
  title?: string
  description?: string
  status: string
  tags: string[] // <-- Изменено: теперь массив тегов
  date: string // ISO string from DB
  participants?: string[]
  name?: string
  phone?: string
  email?: string
  preferredDate?: string
  preferredTime?: string
  createdAt?: string
}

type ViewType = "table" | "calendar" | "day"

export default function RecordsDashboard() {
  const [records, setRecords] = useState<Record[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedTagFilter, setSelectedTagFilter] = useState("all") // <-- Изменено: фильтр по тегу
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState("asc")
  const [loading, setLoading] = useState(true)
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Record | null>(null)
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<ViewType>("table")
  const { toast } = useToast()

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        status: statusFilter,
        tag: selectedTagFilter, // <-- Изменено: передаем выбранный тег
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
  }, [searchQuery, statusFilter, selectedTagFilter, sortBy, sortOrder, toast]) // <-- Изменено: зависимость от selectedTagFilter

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  // Получаем все уникальные теги из текущих записей для фильтра
  const uniqueTags = useMemo(() => {
    const tags = new Set<string>()
    records.forEach((record) => {
      record.tags.forEach((tag) => tags.add(tag))
    })
    return Array.from(tags).sort((a, b) => a.localeCompare(b))
  }, [records])

  // --- Функции для добавления/редактирования ---
  const handleOpenAddDialog = () => {
    setEditingRecord(null)
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
        response = await fetch("/api/records", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ _id: id, ...data }),
        })
      } else {
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

      await fetchRecords()
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

  // --- Функции для удаления ---
  const handleDeleteRecord = async () => {
    if (!recordToDelete) return

    try {
      const response = await fetch(`/api/records?id=${recordToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete record")
      }

      await fetchRecords()
      toast({
        title: "Успех!",
        description: "Запись успешно удалена.",
      })
      setRecordToDelete(null)
    } catch (error) {
      console.error("Error deleting record:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось удалить запись.",
        variant: "destructive",
      })
    }
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setSelectedTagFilter("all") // <-- Изменено: сброс фильтра тегов
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
      return
    }

    const notifiedEvents = JSON.parse(localStorage.getItem("notifiedEvents") || "[]")
    const now = new Date()
    const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000)

    records.forEach((record) => {
      const eventDate = new Date(record.date)
      if (
        record.status === "active" &&
        eventDate > now &&
        eventDate <= fiveDaysFromNow &&
        !notifiedEvents.includes(record._id)
      ) {
        new Notification(`Предстоящее событие: ${record.title || record.name || "Событие"}`, {
          body: `Начнется ${new Date(record.date).toLocaleString()} (${record.tags.join(", ")}).`, // <-- Изменено: теги
          icon: "/placeholder.svg?height=64&width=64",
        })
        notifiedEvents.push(record._id)
      }
    })
    localStorage.setItem("notifiedEvents", JSON.stringify(notifiedEvents))
  }, [records])

  const handleClearNotifications = () => {
    localStorage.removeItem("notifiedEvents")
    toast({
      title: "Уведомления сброшены",
      description: "История отправленных уведомлений очищена.",
    })
  }

  useEffect(() => {
    requestNotificationPermission()
    checkAndSendNotifications()
    const interval = setInterval(checkAndSendNotifications, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [requestNotificationPermission, checkAndSendNotifications])

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Управление Записями</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <Input
          placeholder="Поиск по названию, описанию, имени, email или тегам..."
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
        <Select value={selectedTagFilter} onValueChange={setSelectedTagFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Фильтр по тегу" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все теги</SelectItem>
            {uniqueTags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleClearFilters} variant="outline">
          Сбросить фильтры
        </Button>
        <Button onClick={handleOpenAddDialog} className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          Запланировать занятие
        </Button>
        <Button onClick={handleClearNotifications} variant="outline" className="flex items-center gap-2 bg-transparent">
          <BellOff className="w-4 h-4" />
          Сбросить уведомления
        </Button>
      </div>

      <div className="flex justify-center mb-6">
        <ToggleGroup
          type="single"
          value={currentView}
          onValueChange={(value: ViewType) => value && setCurrentView(value)}
        >
          <ToggleGroupItem value="table" aria-label="Вид таблицы">
            <Table className="h-4 w-4 mr-2" /> Таблица
          </ToggleGroupItem>
          <ToggleGroupItem value="day" aria-label="Вид по дням">
            <Clock className="h-4 w-4 mr-2" /> Сегодня
          </ToggleGroupItem>
          <ToggleGroupItem value="calendar" aria-label="Вид календаря">
            <CalendarDays className="h-4 w-4 mr-2" /> Календарь
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Загрузка данных...</span>
        </div>
      ) : (
        <>
          {currentView === "table" && (
            <RecordsTable
              records={records}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              onEdit={handleOpenEditDialog}
              onDelete={(id) => setRecordToDelete(id)}
            />
          )}
          {currentView === "day" && <DayView records={records} onEdit={handleOpenEditDialog} />}
          {currentView === "calendar" && <CalendarView records={records} onEdit={handleOpenEditDialog} />}
        </>
      )}

      <LessonFormDialog
        isOpen={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        onSubmit={handleFormSubmit}
        initialData={editingRecord}
      />

      <AlertDialog open={!!recordToDelete} onOpenChange={(open) => !open && setRecordToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены, что хотите удалить эту запись?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Запись будет безвозвратно удалена из базы данных.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRecord}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
