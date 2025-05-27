'use client'

import { useRouter, useParams } from 'next/navigation'
import { languages, languageNames, Language } from '@/lib/i18n/config'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function LanguageSelector() {
  const router = useRouter()
  const params = useParams()
  const currentLang = (params?.lang as Language) || 'en'
  
  const handleLanguageChange = (newLang: string) => {
    // Replace the language segment in the URL
    const newPath = window.location.pathname.replace(
      `/${currentLang}`,
      `/${newLang}`
    )
    router.push(newPath)
  }
  
  return (
    <Select value={currentLang} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang} value={lang}>
            {languageNames[lang]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
