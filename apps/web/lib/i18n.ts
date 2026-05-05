import en from '../locales/en.json'
import ja from '../locales/ja.json'

type Translations = typeof en

const translations: Record<string, Translations> = {
  EN: en,
  JA: ja,
}

export function getTranslations(language?: string): Translations {
  if (!language) return en
  
  const upperLang = language.toUpperCase()
  
  return translations[upperLang] || en
}