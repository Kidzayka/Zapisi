import Fuse from "fuse.js"
import { analyzeAndGenerateTags } from "./tag-analyzer"

export interface SearchResult {
  item: any
  matches?: Fuse.FuseResultMatch[]
  score?: number
}

export interface SearchFilters {
  query: string
  tags: string[]
  status: string[]
  dateRange: {
    from?: Date
    to?: Date
  }
  participants: string[]
  priority: string[]
  locations: string[]
}

export class AdvancedSearchEngine {
  private fuse: Fuse<any>
  private records: any[] = []

  constructor(records: any[]) {
    this.records = records
    this.fuse = new Fuse(records, {
      keys: [
        { name: "title", weight: 0.7 },
        { name: "name", weight: 0.6 },
        { name: "description", weight: 0.4 },
        { name: "tags", weight: 0.5 },
        { name: "email", weight: 0.3 },
        { name: "phone", weight: 0.2 },
      ],
      threshold: 0.3,
      includeScore: true,
      includeMatches: true,
      ignoreLocation: true,
      minMatchCharLength: 2,
    })
  }

  search(query: string, filters?: Partial<SearchFilters>): SearchResult[] {
    if (!query.trim() && !filters) {
      return this.records.map((item) => ({ item }))
    }

    let results: SearchResult[] = []

    // Fuzzy search если есть запрос
    if (query.trim()) {
      results = this.fuse.search(query).map((result) => ({
        item: result.item,
        matches: result.matches,
        score: result.score,
      }))
    } else {
      results = this.records.map((item) => ({ item }))
    }

    // Применяем фильтры
    if (filters) {
      results = this.applyFilters(results, filters)
    }

    return results
  }

  private applyFilters(results: SearchResult[], filters: Partial<SearchFilters>): SearchResult[] {
    return results.filter(({ item }) => {
      // Фильтр по тегам
      if (filters.tags && filters.tags.length > 0) {
        const hasAnyTag = filters.tags.some((tag) => item.tags && item.tags.includes(tag))
        if (!hasAnyTag) return false
      }

      // Фильтр по статусу
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(item.status)) return false
      }

      // Фильтр по дате
      if (filters.dateRange?.from || filters.dateRange?.to) {
        const itemDate = new Date(item.date)
        if (filters.dateRange.from && itemDate < filters.dateRange.from) return false
        if (filters.dateRange.to && itemDate > filters.dateRange.to) return false
      }

      // Фильтр по участникам
      if (filters.participants && filters.participants.length > 0) {
        const hasAnyParticipant = filters.participants.some(
          (participant) => item.participants && item.participants.includes(participant),
        )
        if (!hasAnyParticipant) return false
      }

      return true
    })
  }

  getSuggestions(query: string): string[] {
    if (!query.trim()) return []

    const suggestions = new Set<string>()

    // Предложения из названий
    this.records.forEach((record) => {
      if (record.title && record.title.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(record.title)
      }
      if (record.name && record.name.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(record.name)
      }
    })

    // AI предложения тегов
    const aiTags = analyzeAndGenerateTags(query)
    aiTags.forEach((tag) => suggestions.add(tag.tag))

    return Array.from(suggestions).slice(0, 8)
  }

  getPopularSearches(): string[] {
    const queries = ["логопедия", "консультация", "групповое занятие", "индивидуальное", "развитие речи"]
    return queries
  }

  updateRecords(records: any[]) {
    this.records = records
    this.fuse.setCollection(records)
  }
}
