'use client'

import React, { createContext, useContext, useState } from 'react'

type Language = 'zh' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
  t: (key: string) => string
}

const translations = {
  zh: {
    // Navigation
    'nav.tools': '工具',
    'nav.features': '功能',
    'nav.about': '关于',
    'nav.contact': '联系',
    
    // Hero Section
    'hero.badge.new': '最新资讯',
    'hero.title.main': '释放您的全部潜能',
    'hero.title.with': '与',
    'hero.title.brand': 'coinHyper',
    'hero.subtitle.main': '通过先进的区块链工具将可能性转化为现实',
    'hero.cta.getStarted': '立即开始',
  },
  en: {
    // Navigation
    'nav.tools': 'Tools',
    'nav.features': 'Features',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    
    // Hero Section
    'hero.badge.new': 'What\'s New',
    'hero.title.main': 'Unleash Your Full Potential',
    'hero.title.with': 'with',
    'hero.title.brand': 'coinHyper',
    'hero.subtitle.main': 'Transform Possibilities into Reality with Advanced Blockchain Tools',
    'hero.cta.getStarted': 'Get Started',
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('zh')

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh')
  }

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
} 