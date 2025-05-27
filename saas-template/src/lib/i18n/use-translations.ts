'use client'

import { useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Language, TranslationKey, defaultLanguage } from './config'

// Dynamic imports for translations
const importTranslation = async (lang: Language) => {
  try {
    return (await import(`./locales/${lang}`)).default
  } catch (error) {
    console.error(`Failed to load translations for ${lang}`, error)
    return (await import(`./locales/${defaultLanguage}`)).default
  }
}

export function useTranslations() {
  const params = useParams()
  const lang = (params?.lang as Language) || defaultLanguage
  
  const t = useCallback(
    async (key: TranslationKey): Promise<string> => {
      const translations = await importTranslation(lang)
      return translations[key] || key
    },
    [lang]
  )
  
  return { t, lang }
}
