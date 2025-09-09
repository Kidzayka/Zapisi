export const LANGUAGES = {
  ru: "Русский",
  en: "English",
} as const

export const THEMES = {
  light: "Светлая",
  dark: "Темная",
  purple: "Фиолетовая",
  blue: "Синяя",
  green: "Зеленая",
} as const

export const TAG_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#6b7280", // gray
  "#84cc16", // lime
] as const

export const TEMPLATES = [
  {
    id: "speech-therapy",
    name: "Логопедическое занятие",
    tags: ["логопедия", "речь"],
    description: "Индивидуальное логопедическое занятие",
  },
  {
    id: "reading-lesson",
    name: "Урок чтения",
    tags: ["чтение", "обучение"],
    description: "Занятие по развитию навыков чтения",
  },
  {
    id: "consultation",
    name: "Консультация",
    tags: ["консультация", "диагностика"],
    description: "Консультация с родителями",
  },
  {
    id: "group-lesson",
    name: "Групповое занятие",
    tags: ["группа", "социализация"],
    description: "Групповое развивающее занятие",
  },
] as const

export const NOTIFICATION_SOUNDS = {
  default: "/sounds/notification.mp3",
  bell: "/sounds/bell.mp3",
  chime: "/sounds/chime.mp3",
  gentle: "/sounds/gentle.mp3",
} as const
