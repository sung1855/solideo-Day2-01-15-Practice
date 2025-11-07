/**
 * i18n 초기화 및 훅
 */

import { ko } from './ko'
import { en } from './en'
import type { Translation } from './ko'

const translations: Record<string, Translation> = {
  ko,
  en,
}

const defaultLocale = import.meta.env.VITE_DEFAULT_LOCALE || 'ko'

let currentLocale = defaultLocale

export function getTranslation(): Translation {
  return translations[currentLocale] || translations.ko
}

export function setLocale(locale: string): void {
  if (translations[locale]) {
    currentLocale = locale
  }
}

export function getCurrentLocale(): string {
  return currentLocale
}

// React Hook
import { useMemo } from 'react'

export function useTranslation() {
  return useMemo(() => getTranslation(), [currentLocale])
}
