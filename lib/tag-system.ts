export interface TagCategory {
  id: string
  name: string
  color: string
  icon: string
  description?: string
}

export interface EnhancedTag {
  id: string
  name: string
  category: string
  color: string
  description?: string
  usageCount: number
  createdAt: Date
  lastUsed: Date
  isSystem: boolean
  aliases: string[]
  parent?: string
  children: string[]
}

export const TAG_CATEGORIES: TagCategory[] = [
  {
    id: "therapy",
    name: "Терапия",
    color: "#ef4444",
    icon: "🎯",
    description: "Терапевтические направления",
  },
  {
    id: "age-group",
    name: "Возрастные группы",
    color: "#3b82f6",
    icon: "👥",
    description: "Возрастная категория клиентов",
  },
  {
    id: "skill-type",
    name: "Типы навыков",
    color: "#22c55e",
    icon: "🧠",
    description: "Развиваемые навыки",
  },
  {
    id: "session-format",
    name: "Формат занятий",
    color: "#f59e0b",
    icon: "📋",
    description: "Формат проведения",
  },
  {
    id: "priority",
    name: "Приоритет",
    color: "#8b5cf6",
    icon: "⭐",
    description: "Уровень приоритета",
  },
  {
    id: "location",
    name: "Место проведения",
    color: "#06b6d4",
    icon: "📍",
    description: "Локация занятия",
  },
]

export const SYSTEM_TAGS: EnhancedTag[] = [
  // Терапия
  {
    id: "speech-therapy",
    name: "Логопедия",
    category: "therapy",
    color: "#ef4444",
    usageCount: 0,
    createdAt: new Date(),
    lastUsed: new Date(),
    isSystem: true,
    aliases: ["речевая терапия", "логопедическое занятие"],
    children: ["articulation", "phonetics"],
  },
  {
    id: "psychology",
    name: "Психология",
    category: "therapy",
    color: "#ec4899",
    usageCount: 0,
    createdAt: new Date(),
    lastUsed: new Date(),
    isSystem: true,
    aliases: ["психологическая помощь"],
    children: [],
  },

  // Возрастные группы
  {
    id: "preschool",
    name: "Дошкольники",
    category: "age-group",
    color: "#3b82f6",
    usageCount: 0,
    createdAt: new Date(),
    lastUsed: new Date(),
    isSystem: true,
    aliases: ["3-6 лет", "детский сад"],
    children: [],
  },
  {
    id: "school-age",
    name: "Школьники",
    category: "age-group",
    color: "#1d4ed8",
    usageCount: 0,
    createdAt: new Date(),
    lastUsed: new Date(),
    isSystem: true,
    aliases: ["7-17 лет", "школа"],
    children: [],
  },

  // Типы навыков
  {
    id: "reading",
    name: "Чтение",
    category: "skill-type",
    color: "#22c55e",
    usageCount: 0,
    createdAt: new Date(),
    lastUsed: new Date(),
    isSystem: true,
    aliases: ["навыки чтения"],
    children: [],
  },
  {
    id: "writing",
    name: "Письмо",
    category: "skill-type",
    color: "#16a34a",
    usageCount: 0,
    createdAt: new Date(),
    lastUsed: new Date(),
    isSystem: true,
    aliases: ["навыки письма", "каллиграфия"],
    children: [],
  },

  // Формат занятий
  {
    id: "individual",
    name: "Индивидуальное",
    category: "session-format",
    color: "#f59e0b",
    usageCount: 0,
    createdAt: new Date(),
    lastUsed: new Date(),
    isSystem: true,
    aliases: ["1 на 1", "персональное"],
    children: [],
  },
  {
    id: "group",
    name: "Групповое",
    category: "session-format",
    color: "#d97706",
    usageCount: 0,
    createdAt: new Date(),
    lastUsed: new Date(),
    isSystem: true,
    aliases: ["группа", "коллективное"],
    children: [],
  },

  // Приоритет
  {
    id: "high-priority",
    name: "Высокий приоритет",
    category: "priority",
    color: "#dc2626",
    usageCount: 0,
    createdAt: new Date(),
    lastUsed: new Date(),
    isSystem: true,
    aliases: ["срочно", "важно"],
    children: [],
  },
  {
    id: "normal-priority",
    name: "Обычный приоритет",
    category: "priority",
    color: "#8b5cf6",
    usageCount: 0,
    createdAt: new Date(),
    lastUsed: new Date(),
    isSystem: true,
    aliases: ["стандартно"],
    children: [],
  },
]

export class TagSystemManager {
  private tags: Map<string, EnhancedTag> = new Map()

  constructor() {
    // Инициализируем системными тегами
    SYSTEM_TAGS.forEach((tag) => {
      this.tags.set(tag.id, { ...tag })
    })
  }

  createTag(tag: Omit<EnhancedTag, "id" | "createdAt" | "lastUsed" | "usageCount" | "isSystem">): EnhancedTag {
    const id = this.generateTagId(tag.name)
    const newTag: EnhancedTag = {
      ...tag,
      id,
      createdAt: new Date(),
      lastUsed: new Date(),
      usageCount: 0,
      isSystem: false,
    }

    this.tags.set(id, newTag)
    return newTag
  }

  updateTag(id: string, updates: Partial<EnhancedTag>): boolean {
    const tag = this.tags.get(id)
    if (!tag || tag.isSystem) return false

    this.tags.set(id, { ...tag, ...updates })
    return true
  }

  deleteTag(id: string): boolean {
    const tag = this.tags.get(id)
    if (!tag || tag.isSystem) return false

    return this.tags.delete(id)
  }

  getTag(id: string): EnhancedTag | undefined {
    return this.tags.get(id)
  }

  getAllTags(): EnhancedTag[] {
    return Array.from(this.tags.values())
  }

  getTagsByCategory(categoryId: string): EnhancedTag[] {
    return this.getAllTags().filter((tag) => tag.category === categoryId)
  }

  searchTags(query: string): EnhancedTag[] {
    const lowerQuery = query.toLowerCase()
    return this.getAllTags().filter(
      (tag) =>
        tag.name.toLowerCase().includes(lowerQuery) ||
        tag.aliases.some((alias) => alias.toLowerCase().includes(lowerQuery)),
    )
  }

  incrementTagUsage(tagName: string): void {
    const tag = Array.from(this.tags.values()).find((t) => t.name === tagName || t.aliases.includes(tagName))

    if (tag) {
      tag.usageCount++
      tag.lastUsed = new Date()
    }
  }

  getMostUsedTags(limit = 10): EnhancedTag[] {
    return this.getAllTags()
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit)
  }

  getRecentTags(limit = 10): EnhancedTag[] {
    return this.getAllTags()
      .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
      .slice(0, limit)
  }

  getTagSuggestions(query: string): string[] {
    const suggestions = new Set<string>()

    // Поиск по именам
    this.searchTags(query).forEach((tag) => {
      suggestions.add(tag.name)
      tag.aliases.forEach((alias) => {
        if (alias.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(alias)
        }
      })
    })

    return Array.from(suggestions).slice(0, 8)
  }

  private generateTagId(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-zA-Zа-яА-Я0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
  }
}
