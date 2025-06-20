'use client';

import { motion } from 'framer-motion';
import { useMemo, memo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { 
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

// 懒加载视频组件
const VideoBackground = dynamic(() => import('./VideoBackground'), {
  loading: () => <div className="absolute inset-0 bg-gray-950" />,
  ssr: false,
});

// 滚动数据常量
const CRYPTO_DATA = [
  'BTC $43,521.83 +2.34%',
  'ETH $2,687.92 +1.85%', 
  'BNB $308.47 -0.73%',
  'SOL $98.32 +4.12%',
  'ADA $0.4521 +0.95%',
  'XRP $0.6283 -1.24%'
];

// 动画配置常量
const ANIMATION_CONFIG = {
  containerVariants: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  },
  itemVariants: {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
      },
    },
  },
  buttonHover: { scale: 1.05 },
  buttonTap: { scale: 0.95 },
  socialHover: { scale: 1.1, y: -2 },
};

// 主题样式类型
interface ThemeClasses {
  section: string;
  videoOverlay: string;
  gradientOverlay: string;
  badge: string;
  badgeText: string;
  badgeDot: string;
  titleText: string;
  withText: string;
  brandText: string;
  subtitleText: string;
  buttonBg: string;
  buttonShadow: string;
  socialButton: string;
}

// 主题样式钩子
const useThemeStyles = (theme: string): ThemeClasses => {
  return useMemo(() => {
    if (theme === 'light') {
      return {
        section: 'bg-gray-100',
        videoOverlay: 'bg-white/60',
        gradientOverlay: 'bg-gradient-to-b from-gray-100/80 via-transparent to-gray-100/80',
        badge: 'bg-blue-100/80 border-blue-200/50',
        badgeText: 'text-blue-700',
        badgeDot: 'bg-blue-500',
        titleText: 'bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent',
        withText: 'bg-gradient-to-r from-gray-600 to-gray-700 bg-clip-text text-transparent',
        brandText: 'bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent',
        subtitleText: 'bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent',
        buttonBg: 'bg-blue-600 hover:bg-blue-700',
        buttonShadow: 'hover:shadow-[0_8px_30px_rgba(59,130,246,0.3)]',
        socialButton: 'border-gray-400 hover:border-gray-600 text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-blue-100/20 hover:to-purple-100/20'
      };
    }
    return {
      section: 'bg-gray-950',
      videoOverlay: 'bg-slate-900/40',
      gradientOverlay: 'bg-gradient-to-b from-gray-950/60 via-transparent to-gray-950/60',
      badge: 'bg-blue-500/10 border-blue-500/20',
      badgeText: 'text-blue-300',
      badgeDot: 'bg-blue-500',
      titleText: 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent',
      withText: 'bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent',
      brandText: 'bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent',
      subtitleText: 'bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent',
      buttonBg: 'bg-neutral-800 hover:bg-neutral-700',
      buttonShadow: 'hover:shadow-[0_8px_30px_rgba(255,255,255,0.3)]',
      socialButton: 'border-gray-700 hover:border-gray-600 text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10'
    };
  }, [theme]);
};

// 滚动数据组件
const ScrollingTicker = memo(({ data }: { data: string[] }) => {
  const tripleData = useMemo(() => [...data, ...data, ...data], [data]);
  
  return (
    <aside className="absolute top-20 left-0 w-full overflow-hidden opacity-20" aria-label="Live cryptocurrency prices">
      <motion.div
        className="flex space-x-12 whitespace-nowrap text-gray-400 text-sm font-mono"
        animate={{ x: [-1000, 1000] }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        role="marquee"
        aria-live="polite"
      >
        {tripleData.map((item, index) => (
          <span key={index} aria-label={`Price data: ${item}`}>{item}</span>
        ))}
      </motion.div>
    </aside>
  );
});

ScrollingTicker.displayName = 'ScrollingTicker';

// 社交按钮组件
const SocialButton = memo(({ platform, href, themeClasses }: { 
  platform: string; 
  href: string; 
  themeClasses: ThemeClasses; 
}) => (
  <motion.a
    href={href}
    whileHover={ANIMATION_CONFIG.socialHover}
    className={`w-12 h-12 rounded-full ${themeClasses.socialButton} flex items-center justify-center transition-all duration-300`}
    aria-label={`Follow us on ${platform}`}
    role="link"
  >
    <span className="text-sm font-medium" aria-hidden="true">
      {platform === 'X' ? 'X' : platform.charAt(0)}
    </span>
  </motion.a>
));

SocialButton.displayName = 'SocialButton';

function HeroSection() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const themeClasses = useThemeStyles(theme);
  
  // 优化点击处理函数
  const handleGetStarted = useCallback(() => {
    // 可以添加实际的导航逻辑
    console.log('Get started clicked');
  }, []);

  // 社交平台数据
  const socialPlatforms = useMemo(() => [
    { name: 'X', href: '#x' },
    { name: 'Instagram', href: '#instagram' },
    { name: 'Facebook', href: '#facebook' },
    { name: 'LinkedIn', href: '#linkedin' }
  ], []);

  return (
    <main className={`relative min-h-screen flex items-center justify-center ${themeClasses.section} overflow-hidden`}>
      {/* 优化后的视频背景 */}
      <VideoBackground themeClasses={themeClasses} />
      
      {/* 滚动数据 */}
      <ScrollingTicker data={CRYPTO_DATA} />

      {/* Main Content */}
      <article className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <motion.div
          variants={ANIMATION_CONFIG.containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div
            variants={ANIMATION_CONFIG.itemVariants}
            className={`inline-flex items-center px-4 py-2 rounded-full ${themeClasses.badge} mb-8`}
            role="banner"
          >
            <div className={`w-2 h-2 ${themeClasses.badgeDot} rounded-full mr-3 animate-pulse`} aria-hidden="true" />
            <span className={`text-sm font-medium ${themeClasses.badgeText}`}>
              {t('hero.badge.new')}
            </span>
          </motion.div>

          {/* Main Heading with Gradient Text */}
          <header>
            <motion.h1
              variants={ANIMATION_CONFIG.itemVariants}
              className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
            >
              <span className={themeClasses.titleText}>
                {t('hero.title.main')}
              </span>
              <br />
              <span className={themeClasses.withText}>{t('hero.title.with')}</span>{' '}
              <span className={`${themeClasses.brandText} italic font-light`}>
                {t('hero.title.brand')}
              </span>
            </motion.h1>

            {/* Subtitle with Gradient */}
            <motion.p
              variants={ANIMATION_CONFIG.itemVariants}
              className={`text-xl mb-12 max-w-2xl mx-auto ${themeClasses.subtitleText}`}
              role="doc-subtitle"
            >
              {t('hero.subtitle.main')}
            </motion.p>
          </header>

          {/* CTA Button */}
          <motion.div
            variants={ANIMATION_CONFIG.itemVariants}
            className="mb-16"
          >
            <motion.button
              whileHover={ANIMATION_CONFIG.buttonHover}
              whileTap={ANIMATION_CONFIG.buttonTap}
              onClick={handleGetStarted}
              className={`group inline-flex items-center px-8 py-4 ${themeClasses.buttonBg} text-white font-medium rounded-xl 
                       transition-all duration-300 shadow-lg ${themeClasses.buttonShadow}`}
              aria-label={`${t('hero.cta.getStarted')} - Start using coinHyper tools`}
            >
              <span>{t('hero.cta.getStarted')}</span>
              <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </motion.button>
          </motion.div>

          {/* Social Icons */}
          <motion.nav
            variants={ANIMATION_CONFIG.itemVariants}
            className="flex justify-center space-x-6"
            aria-label="Social media links"
          >
            {socialPlatforms.map((platform) => (
              <SocialButton
                key={platform.name}
                platform={platform.name}
                href={platform.href}
                themeClasses={themeClasses}
              />
            ))}
          </motion.nav>
        </motion.div>
      </article>
    </main>
  );
}

export default memo(HeroSection); 