"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpDown, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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
  preferredDate?: string
  preferredTime?: string
  createdAt?: string
}

interface RecordsTableProps {
  records: Record[]
  sortBy: string
  setSortBy: (key: string) => void
  sortOrder: string
  setSortOrder: (order: string) => void
  onEdit: (record: Record) => void
  onDelete: (id: string) => void
}

export function RecordsTable({
  records,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  onEdit,
  onDelete,
}: RecordsTableProps) {
  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(key)
      setSortOrder("asc")
    }
  }

  const getSortIcon = (key: string) => {
    if (sortBy === key) {
      return sortOrder === "asc" ? "▲" : "▼"
    }
    return ""
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort("title")} className="px-0">
                Название {getSortIcon("title")}
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Описание</TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort("status")} className="px-0">
                Статус {getSortIcon("status")}
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort("tags")} className="px-0">
                Теги {getSortIcon("tags")} {/* <-- Изменено: теперь теги */}
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort("date")} className="px-0">
                Дата и Время {getSortIcon("date")}
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Участники</TableHead>
            <TableHead>Телефон</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="w-[120px] text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                Записи не найдены.
              </TableCell>
            </TableRow>
          ) : (
            records.map((record) => (
              <TableRow key={record._id}>
                <TableCell className="font-medium">{record.title || record.name || "N/A"}</TableCell>
                <TableCell>{record.description || "N/A"}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      record.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : record.status === "pending"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {record.status === "active" ? "Активно" : record.status === "pending" ? "Ожидает" : "Завершено"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {record.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </TableCell>{" "}
                {/* <-- Изменено: отображение тегов */}
                <TableCell>{new Date(record.date).toLocaleString()}</TableCell>
                <TableCell>{record.participants?.join(", ") || record.name || "N/A"}</TableCell>
                <TableCell>{record.phone || "N/A"}</TableCell>
                <TableCell>{record.email || "N/A"}</TableCell>
                <TableCell className="text-right flex gap-1 justify-end">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(record)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Редактировать</span>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(record._id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <span className="sr-only">Удалить</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
