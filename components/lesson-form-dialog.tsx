"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface RecordData {
  _id?: string
  title?: string
  description?: string
  status?: string
  category?: string
  date?: string
  participants?: string[]
  name?: string
  phone?: string
  email?: string
  preferredDate?: string // Добавлено
  preferredTime?: string // Добавлено
  createdAt?: string
}

interface LessonFormDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any, id?: string) => void
  initialData?: RecordData | null
}

export function LessonFormDialog({ isOpen, onOpenChange, onSubmit, initialData }: LessonFormDialogProps) {
  const [id, setId] = useState<string | undefined>(initialData?._id)
  const [title, setTitle] = useState(initialData?.title || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [category, setCategory] = useState(initialData?.category || "Appointment") // По умолчанию "Appointment"
  const [participants, setParticipants] = useState(initialData?.participants?.join(", ") || "")
  const [name, setName] = useState(initialData?.name || "")
  const [phone, setPhone] = useState(initialData?.phone || "")
  const [email, setEmail] = useState(initialData?.email || "")
  const [status, setStatus] = useState(initialData?.status || "active")

  useEffect(() => {
    if (initialData) {
      setId(initialData._id)
      setTitle(initialData.title || "")
      setDescription(initialData.description || "")
      setCategory(initialData.category || "Appointment")
      setParticipants(initialData.participants?.join(", ") || "")
      setName(initialData.name || "")
      setPhone(initialData.phone || "")
      setEmail(initialData.email || "")
      setStatus(initialData.status || "active")

      // Форматируем дату и время для полей input type="date" и "time"
      // Приоритет: preferredDate/preferredTime, затем date
      let d: Date | null = null
      if (initialData.preferredDate && initialData.preferredTime) {
        const datePart = new Date(initialData.preferredDate).toISOString().split("T")[0]
        d = new Date(`${datePart}T${initialData.preferredTime}:00Z`)
      } else if (initialData.date) {
        d = new Date(initialData.date)
      }

      if (d) {
        setDate(d.toISOString().split("T")[0]) // YYYY-MM-DD
        setTime(d.toTimeString().split(" ")[0].substring(0, 5)) // HH:MM
      } else {
        setDate("")
        setTime("")
      }
    } else {
      // Сброс формы при открытии для добавления
      setId(undefined)
      setTitle("")
      setDescription("")
      setDate("")
      setTime("")
      setCategory("Appointment") // По умолчанию "Appointment"
      setParticipants("")
      setName("")
      setPhone("")
      setEmail("")
      setStatus("active")
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // preferredDate и preferredTime отправляются как есть,
    // а date будет сформирован на сервере из них.
    // Если preferredDate/Time не заполнены, но date/time заполнены,
    // то date будет сформирован из date/time полей формы.
    const dataToSend: RecordData = {
      title,
      description,
      status,
      category,
      participants: participants
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean),
      name,
      phone,
      email,
    }

    // Если поля даты/времени заполнены, отправляем их для формирования 'date' на сервере
    if (date && time) {
      dataToSend.preferredDate = date // Отправляем как string YYYY-MM-DD
      dataToSend.preferredTime = time // Отправляем как string HH:MM
      // dataToSend.date = `${date}T${time}:00Z`; // Можно отправить и так, но серверная логика уже это делает
    }

    onSubmit(dataToSend, id)
  }

  const dialogTitle = initialData ? "Редактировать занятие" : "Запланировать новое занятие"
  const buttonText = initialData ? "Сохранить изменения" : "Добавить занятие"

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>Заполните детали для занятия или встречи.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Имя (для записи)
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Имя клиента"
              className="col-span-3"
              required // Сделаем имя обязательным, так как оно часто используется для title/participants
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Телефон
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@example.com"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Дата
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time" className="text-right">
              Время
            </Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Категория
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lecture">Лекция</SelectItem>
                <SelectItem value="Workshop">Практикум</SelectItem>
                <SelectItem value="Meeting">Встреча</SelectItem>
                <SelectItem value="Appointment">Запись</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Статус
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Выберите статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Активно</SelectItem>
                <SelectItem value="pending">Ожидает</SelectItem>
                <SelectItem value="completed">Завершено</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Поля title, description, participants сделаем опциональными в форме,
              так как они могут формироваться автоматически */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Название (авто)
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="Автоматически из имени, если пусто"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Описание (авто)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Автоматически из телефона/email, если пусто"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="participants" className="text-right">
              Участники (авто)
            </Label>
            <Input
              id="participants"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              placeholder="Автоматически из имени, если пусто"
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            <Button type="submit">{buttonText}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
