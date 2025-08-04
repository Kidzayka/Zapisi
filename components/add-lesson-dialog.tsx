"use client"

import type React from "react"

import { useState } from "react"
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

interface AddLessonDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onAddLesson: (data: any) => void
}

export function AddLessonDialog({ isOpen, onOpenChange, onAddLesson }: AddLessonDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [category, setCategory] = useState("Lecture")
  const [participants, setParticipants] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const fullDateTime = `${date}T${time}:00Z` // Формат ISO 8601
    onAddLesson({
      title,
      description,
      status: "active", // Новые занятия по умолчанию активны
      category,
      date: fullDateTime,
      participants: participants
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean),
    })
    // Сброс формы
    setTitle("")
    setDescription("")
    setDate("")
    setTime("")
    setCategory("Lecture")
    setParticipants("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Запланировать новое занятие</DialogTitle>
          <DialogDescription>Заполните детали для нового занятия или встречи.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Название
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Описание
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="participants" className="text-right">
              Участники
            </Label>
            <Input
              id="participants"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              placeholder="Иван, Мария, Петр"
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            <Button type="submit">Добавить занятие</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
