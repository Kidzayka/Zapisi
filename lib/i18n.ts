export const translations = {
  ru: {
    // Основные
    dashboard: "Панель управления",
    records: "Записи",
    analytics: "Аналитика",
    settings: "Настройки",
    profile: "Профиль",

    // Действия
    add: "Добавить",
    edit: "Редактировать",
    delete: "Удалить",
    save: "Сохранить",
    cancel: "Отмена",
    export: "Экспорт",
    import: "Импорт",

    // Статусы
    active: "Активно",
    pending: "Ожидает",
    completed: "Завершено",

    // Уведомления
    notifications: "Уведомления",
    success: "Успех!",
    error: "Ошибка",
    warning: "Предупреждение",

    // Формы
    name: "Имя",
    email: "Email",
    phone: "Телефон",
    date: "Дата",
    time: "Время",
    description: "Описание",
    tags: "Теги",

    // Аналитика
    totalRecords: "Всего записей",
    activeRecords: "Активных записей",
    completedRecords: "Завершенных записей",
    thisWeek: "На этой неделе",
    thisMonth: "В этом месяце",

    // Шаблоны
    templates: "Шаблоны",
    useTemplate: "Использовать шаблон",
    createTemplate: "Создать шаблон",
  },
  en: {
    // Basic
    dashboard: "Dashboard",
    records: "Records",
    analytics: "Analytics",
    settings: "Settings",
    profile: "Profile",

    // Actions
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    export: "Export",
    import: "Import",

    // Statuses
    active: "Active",
    pending: "Pending",
    completed: "Completed",

    // Notifications
    notifications: "Notifications",
    success: "Success!",
    error: "Error",
    warning: "Warning",

    // Forms
    name: "Name",
    email: "Email",
    phone: "Phone",
    date: "Date",
    time: "Time",
    description: "Description",
    tags: "Tags",

    // Analytics
    totalRecords: "Total Records",
    activeRecords: "Active Records",
    completedRecords: "Completed Records",
    thisWeek: "This Week",
    thisMonth: "This Month",

    // Templates
    templates: "Templates",
    useTemplate: "Use Template",
    createTemplate: "Create Template",
  },
} as const

export type Language = keyof typeof translations
export type TranslationKey = keyof typeof translations.ru

export function t(key: TranslationKey, lang: Language = "ru"): string {
  return translations[lang][key] || translations.ru[key] || key
}
