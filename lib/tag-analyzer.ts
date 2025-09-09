// Система автоматического анализа и присвоения тегов
export interface TagRule {
  keywords: string[]
  tag: string
  color: string
  priority: number
}

export const TAG_RULES: TagRule[] = [
  // Логопедия и речь
  {
    keywords: ["логопед", "речь", "произношение", "артикуляция", "дикция", "звуки"],
    tag: "логопедия",
    color: "#ef4444",
    priority: 10,
  },
  {
    keywords: ["заикание", "запинки", "темп речи", "ритм речи"],
    tag: "заикание",
    color: "#f97316",
    priority: 9,
  },

  // Чтение и письмо
  {
    keywords: ["чтение", "читать", "книга", "текст", "слоги", "буквы"],
    tag: "чтение",
    color: "#22c55e",
    priority: 8,
  },
  {
    keywords: ["письмо", "писать", "почерк", "каллиграфия", "прописи"],
    tag: "письмо",
    color: "#06b6d4",
    priority: 8,
  },
  {
    keywords: ["дислексия", "дисграфия", "трудности чтения", "трудности письма"],
    tag: "дислексия",
    color: "#8b5cf6",
    priority: 9,
  },

  // Развитие и обучение
  {
    keywords: ["развитие", "развивающий", "обучение", "урок", "занятие"],
    tag: "развитие",
    color: "#eab308",
    priority: 6,
  },
  {
    keywords: ["память", "внимание", "концентрация", "мышление", "логика"],
    tag: "когнитивное",
    color: "#ec4899",
    priority: 7,
  },
  {
    keywords: ["моторика", "координация", "движения", "пальчики", "руки"],
    tag: "моторика",
    color: "#84cc16",
    priority: 7,
  },

  // Социальные навыки
  {
    keywords: ["общение", "социализация", "группа", "коллектив", "друзья"],
    tag: "социализация",
    color: "#3b82f6",
    priority: 6,
  },
  {
    keywords: ["поведение", "эмоции", "чувства", "настроение", "психология"],
    tag: "психология",
    color: "#6b7280",
    priority: 6,
  },

  // Возрастные группы
  {
    keywords: ["дошкольник", "детский сад", "малыш", "ребенок", "дети"],
    tag: "дошкольники",
    color: "#f59e0b",
    priority: 5,
  },
  {
    keywords: ["школьник", "школа", "ученик", "класс", "учеба"],
    tag: "школьники",
    color: "#10b981",
    priority: 5,
  },
  {
    keywords: ["подросток", "тинейджер", "старшеклассник"],
    tag: "подростки",
    color: "#8b5cf6",
    priority: 5,
  },

  // Типы занятий
  {
    keywords: ["консультация", "диагностика", "обследование", "тестирование"],
    tag: "консультация",
    color: "#6366f1",
    priority: 8,
  },
  {
    keywords: ["индивидуальный", "персональный", "один на один"],
    tag: "индивидуальное",
    color: "#14b8a6",
    priority: 7,
  },
  {
    keywords: ["групповой", "группа", "коллективный", "команда"],
    tag: "групповое",
    color: "#f59e0b",
    priority: 7,
  },
  {
    keywords: ["онлайн", "дистанционно", "удаленно", "видеосвязь", "zoom"],
    tag: "онлайн",
    color: "#8b5cf6",
    priority: 6,
  },

  // Специальные потребности
  {
    keywords: ["аутизм", "рас", "спектр", "особенности развития"],
    tag: "аутизм",
    color: "#ef4444",
    priority: 9,
  },
  {
    keywords: ["дцп", "церебральный паралич", "нарушения движений"],
    tag: "дцп",
    color: "#f97316",
    priority: 9,
  },
  {
    keywords: ["слух", "слуховой", "глухота", "тугоухость"],
    tag: "нарушения слуха",
    color: "#06b6d4",
    priority: 9,
  },

  // Общие теги
  {
    keywords: ["первичный", "первое", "знакомство", "новый"],
    tag: "первичный прием",
    color: "#22c55e",
    priority: 8,
  },
  {
    keywords: ["повторный", "продолжение", "следующий"],
    tag: "повторный прием",
    color: "#eab308",
    priority: 7,
  },
  {
    keywords: ["срочно", "экстренно", "неотложно"],
    tag: "срочно",
    color: "#ef4444",
    priority: 10,
  },
]

export function analyzeAndGenerateTags(text: string): { tag: string; color: string }[] {
  if (!text) return []

  const normalizedText = text.toLowerCase().trim()
  const foundTags: { tag: string; color: string; priority: number }[] = []

  // Анализируем текст на соответствие правилам
  TAG_RULES.forEach((rule) => {
    const hasKeyword = rule.keywords.some((keyword) => normalizedText.includes(keyword.toLowerCase()))

    if (hasKeyword) {
      foundTags.push({
        tag: rule.tag,
        color: rule.color,
        priority: rule.priority,
      })
    }
  })

  // Сортируем по приоритету и убираем дубликаты
  const uniqueTags = foundTags
    .sort((a, b) => b.priority - a.priority)
    .filter((tag, index, arr) => arr.findIndex((t) => t.tag === tag.tag) === index)
    .slice(0, 5) // Максимум 5 тегов

  // Если не найдено специфичных тегов, добавляем общий
  if (uniqueTags.length === 0) {
    uniqueTags.push({
      tag: "общее",
      color: "#6b7280",
      priority: 1,
    })
  }

  return uniqueTags.map(({ tag, color }) => ({ tag, color }))
}

export function suggestTagsFromName(name: string): string[] {
  const analyzedTags = analyzeAndGenerateTags(name)
  return analyzedTags.map((t) => t.tag)
}

export function getTagColor(tag: string): string {
  const rule = TAG_RULES.find((r) => r.tag === tag)
  return rule?.color || "#6b7280"
}

// Функция для анализа всего контента записи
export function analyzeRecordContent(record: {
  title?: string
  name?: string
  description?: string
  phone?: string
  email?: string
}): { tag: string; color: string }[] {
  const textToAnalyze = [record.title || "", record.name || "", record.description || ""].join(" ")

  return analyzeAndGenerateTags(textToAnalyze)
}
