"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Record {
  _id: string
  title: string
  description: string
  status: string
  category: string
  date: string
  participants: string[]
  // Добавляем новые поля, которые могут прийти из БД
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
}

export function RecordsTable({ records, sortBy, setSortBy, sortOrder, setSortOrder }: RecordsTableProps) {
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
              <Button variant="ghost" onClick={() => handleSort("category")} className="px-0">
                Категория {getSortIcon("category")}
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
            <TableHead>Телефон</TableHead> {/* Добавляем столбец для телефона */}
            <TableHead>Email</TableHead> {/* Добавляем столбец для email */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                Записи не найдены.
              </TableCell>
            </TableRow>
          ) : (
            records.map((record) => (
              <TableRow key={record._id}>
                <TableCell className="font-medium">{record.title}</TableCell>
                <TableCell>{record.description}</TableCell>
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
                <TableCell>{record.category}</TableCell>
                <TableCell>{new Date(record.date).toLocaleString()}</TableCell>
                <TableCell>{record.participants?.join(", ") || record.name || "N/A"}</TableCell>
                <TableCell>{record.phone || "N/A"}</TableCell> {/* Отображаем телефон */}
                <TableCell>{record.email || "N/A"}</TableCell> {/* Отображаем email */}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
