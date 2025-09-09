"use client"

// Утилиты для оптимизации производительности

// Debounce функция для оптимизации поиска
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle функция для ограничения частоты вызовов
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Мемоизация для кэширования результатов
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map()

  return ((...args: any[]) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)
    }

    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

// Lazy loading для компонентов
export const createLazyComponent = <T extends React.ComponentType<any>>(importFunc: () => Promise<{ default: T }>) => {
  return React.lazy(importFunc)
}

// Intersection Observer для lazy loading
export const useIntersectionObserver = (ref: React.RefObject<Element>, options: IntersectionObserverInit = {}) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false)

  React.useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)

    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [ref, options])

  return isIntersecting
}

// Виртуализация для больших списков
export const useVirtualization = (items: any[], itemHeight: number, containerHeight: number) => {
  const [scrollTop, setScrollTop] = React.useState(0)

  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(startIndex + Math.ceil(containerHeight / itemHeight) + 1, items.length)

  const visibleItems = items.slice(startIndex, endIndex)
  const totalHeight = items.length * itemHeight
  const offsetY = startIndex * itemHeight

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
  }
}

// Оптимизация изображений
export const optimizeImage = (src: string, width?: number, height?: number, quality = 80) => {
  if (!src) return src

  // Для Next.js Image optimization
  const params = new URLSearchParams()
  if (width) params.set("w", width.toString())
  if (height) params.set("h", height.toString())
  params.set("q", quality.toString())

  return `/_next/image?url=${encodeURIComponent(src)}&${params.toString()}`
}

// Предзагрузка ресурсов
export const preloadResource = (href: string, as = "fetch") => {
  const link = document.createElement("link")
  link.rel = "preload"
  link.href = href
  link.as = as
  document.head.appendChild(link)
}

// Мониторинг производительности
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now()
  fn()
  const end = performance.now()
  console.log(`⚡ ${name}: ${(end - start).toFixed(2)}ms`)
}

// Web Workers для тяжелых вычислений
export const createWorker = (workerFunction: Function) => {
  const blob = new Blob([`(${workerFunction.toString()})()`], {
    type: "application/javascript",
  })
  return new Worker(URL.createObjectURL(blob))
}

// Service Worker для кэширования
export const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js")
      console.log("✅ Service Worker зарегистрирован:", registration)
    } catch (error) {
      console.error("❌ Ошибка регистрации Service Worker:", error)
    }
  }
}

import React from "react"
