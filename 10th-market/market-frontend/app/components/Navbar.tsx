'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon, LanguageIcon } from '@heroicons/react/24/outline'
import { useTheme } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import Link from 'next/link'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage } = useLanguage()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { key: 'home', href: '/', label: '首页' },
    { key: 'market', href: '/market', label: '市场信息' },
    { key: 'tools', href: '#tools', label: '工具' },
    { key: 'about', href: '#about', label: '关于' }
  ]

  // 主题相关的样式类
  const getThemeClasses = () => {
    if (theme === 'light') {
      return {
        navbar: scrolled 
          ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200' 
          : 'bg-transparent',
        logo: 'text-gray-900',
        navLink: 'text-gray-600 hover:text-gray-900',
        iconButton: 'text-gray-500 hover:text-gray-900',
        ctaButton: 'bg-gray-900 text-white hover:bg-gray-800',
        mobileMenu: 'bg-white/95 backdrop-blur-xl border-t border-gray-200',
        mobileLink: 'text-gray-600 hover:text-gray-900',
        mobileBorder: 'border-gray-200'
      };
    }
    return {
      navbar: scrolled 
        ? 'bg-gray-950/80 backdrop-blur-xl border-b border-gray-800' 
        : 'bg-transparent',
      logo: 'text-white',
      navLink: 'text-gray-300 hover:text-white',
      iconButton: 'text-gray-400 hover:text-white',
      ctaButton: 'bg-white text-black hover:bg-gray-100',
      mobileMenu: 'bg-gray-950/95 backdrop-blur-xl border-t border-gray-800',
      mobileLink: 'text-gray-300 hover:text-white',
      mobileBorder: 'border-gray-800'
    };
  };

  const themeClasses = getThemeClasses();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${themeClasses.navbar}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center"
          >
            <Link href="/" className={`text-2xl font-bold ${themeClasses.logo}`}>
              coinHyper
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <motion.div key={item.key}>
                <Link
                  href={item.href}
                  className={`${themeClasses.navLink} transition-colors duration-300 font-medium hover:transform hover:-translate-y-0.5`}
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Theme & Language Toggle */}
            <div className="hidden md:flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
                className={`p-2 ${themeClasses.iconButton} transition-colors`}
                title="切换语言"
              >
                <LanguageIcon className="h-5 w-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className={`p-2 ${themeClasses.iconButton} transition-colors`}
                title="切换主题"
              >
                {theme === 'dark' ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </motion.button>
            </div>

            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`hidden md:inline-flex items-center px-4 py-2 ${themeClasses.ctaButton} font-medium rounded-lg 
                       transition-all duration-300`}
            >
              开始使用
            </motion.button>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className={`md:hidden p-2 ${themeClasses.iconButton} transition-colors`}
            >
              {isOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden ${themeClasses.mobileMenu}`}
          >
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item) => (
                <motion.div key={item.key}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`block py-3 ${themeClasses.mobileLink} transition-colors font-medium hover:transform hover:translate-x-2`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              
              <div className={`flex items-center space-x-4 pt-4 border-t ${themeClasses.mobileBorder}`}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
                  className={`p-2 ${themeClasses.iconButton} transition-colors`}
                  title="切换语言"
                >
                  <LanguageIcon className="h-5 w-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={toggleTheme}
                  className={`p-2 ${themeClasses.iconButton} transition-colors`}
                  title="切换主题"
                >
                  {theme === 'dark' ? (
                    <SunIcon className="h-5 w-5" />
                  ) : (
                    <MoonIcon className="h-5 w-5" />
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className={`px-4 py-2 ${themeClasses.ctaButton} font-medium rounded-lg 
                           transition-all duration-300`}
                >
                  开始使用
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
} 