'use client';

import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';

const navigationItems = ['Work', 'Experience', 'Blog', 'FAQ', 'Proposal', 'Get in Touch'];

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    try {
      setIsMobileMenuOpen(prev => !prev);
    } catch (error) {
      console.error('Error toggling mobile menu:', error);
    }
  }, []);

  const handleNavItemClick = useCallback((item: string) => {
    try {
      console.log(`Navigation item clicked: ${item}`);
      setIsMobileMenuOpen(false); // 移动端点击后关闭菜单
    } catch (error) {
      console.error('Error handling navigation click:', error);
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, item: string) => {
    try {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleNavItemClick(item);
      }
    } catch (error) {
      console.error('Error handling keydown:', error);
    }
  }, [handleNavItemClick]);

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/10 backdrop-blur-md border-b border-white/10"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="text-2xl font-bold text-white cursor-pointer select-none"
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              try {
                console.log('Logo clicked');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } catch (error) {
                console.error('Error handling logo click:', error);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                try {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } catch (error) {
                  console.error('Error scrolling to top:', error);
                }
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Home"
          >
            ∫∫
          </motion.div>

          {/* Desktop Navigation Items */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems && navigationItems.length > 0 ? (
              navigationItems.map((item, index) => {
                if (!item || typeof item !== 'string') {
                  return null; // 跳过无效项
                }
                
                return (
                  <motion.a
                    key={`${item}-${index}`}
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/30 rounded px-2 py-1"
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: Math.max(0, index * 0.1) }}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavItemClick(item);
                    }}
                    onKeyDown={(e) => handleKeyDown(e, item)}
                  >
                    {item}
                  </motion.a>
                );
              })
            ) : (
              <div className="text-gray-400 text-sm">No navigation items</div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              className="text-white p-2 focus:outline-none focus:ring-2 focus:ring-white/30 rounded"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden mt-4 pb-4 border-t border-white/10"
          >
            <div className="flex flex-col space-y-2 pt-4">
              {navigationItems && navigationItems.length > 0 ? (
                navigationItems.map((item, index) => {
                  if (!item || typeof item !== 'string') {
                    return null;
                  }
                  
                  return (
                    <motion.a
                      key={`mobile-${item}-${index}`}
                      href="#"
                      className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-white/30"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavItemClick(item);
                      }}
                      onKeyDown={(e) => handleKeyDown(e, item)}
                    >
                      {item}
                    </motion.a>
                  );
                })
              ) : (
                <div className="text-gray-400 text-sm px-4">No navigation items</div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
} 