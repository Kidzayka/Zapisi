"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RecordsTable } from "@/components/records-table"
import { AddLessonDialog } from "@/components/add-lesson-dialog"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, PlusCircle } from "lucide-react"

export default function RecordsDashboard() {
  const [records, setRecords] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState("asc")
  const [loading, setLoading] = useState(true)
  const [isAddLessonDialogOpen, setIsAddLessonDialogOpen] = useState(false)
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

  const handleAddLesson = async (newLessonData: any) => {
    try {
      const response = await fetch("/api/records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newLessonData),
      })
      if (!response.ok) {
        throw new Error("Failed to add lesson")
      }
      const addedRecord = await response.json()
      setRecords((prevRecords) => [...prevRecords, addedRecord])
      toast({
        title: "Успех!",
        description: "Занятие успешно добавлено.",
      })
      setIsAddLessonDialogOpen(false)
    } catch (error) {
      console.error("Error adding lesson:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось добавить занятие.",
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

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Управление Записями</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <Input
          placeholder="Поиск по названию или описанию..."
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
        <Button onClick={() => setIsAddLessonDialogOpen(true)} className="flex items-center gap-2">
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
        />
      )}

      <AddLessonDialog
        isOpen={isAddLessonDialogOpen}
        onOpenChange={setIsAddLessonDialogOpen}
        onAddLesson={handleAddLesson}
      />
    </div>
  )
}
