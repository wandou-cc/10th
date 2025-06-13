'use client';

import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import ToolsSection from './components/ToolsSection';
import ProjectsSection from './components/ProjectsSection';
import AboutSection from './components/AboutSection';
import ExperienceSection from './components/ExperienceSection';
import BlogSection from './components/BlogSection';
import FAQSection from './components/FAQSection';
import FooterSection from './components/FooterSection';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* 动态渐变背景 */}
      <div className="fixed inset-0 -z-10">
        {/* 主背景层 - 中间向两边渐变 */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(ellipse at center, #581c87 0%, #1e1b4b 40%, #0f172a 80%)',
              'radial-gradient(ellipse at center, #7c3aed 0%, #312e81 40%, #1e1b4b 80%)',
              'radial-gradient(ellipse at center, #be185d 0%, #0c4a6e 40%, #1e3a8a 80%)',
              'radial-gradient(ellipse at center, #581c87 0%, #1e1b4b 40%, #0f172a 80%)'
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* 中心聚焦光效 */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 -translate-x-1/2 -translate-y-1/2 bg-purple-400/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 0.8, 1],
            opacity: [0.3, 0.6, 0.2, 0.3]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* 左侧浮动光点 */}
        <motion.div
          className="absolute w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -80, 40, 0],
            scale: [1, 1.2, 0.9, 1]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ top: '20%', left: '10%' }}
        />
        
        {/* 右侧浮动光点 */}
        <motion.div
          className="absolute w-80 h-80 bg-pink-500/15 rounded-full blur-3xl"
          animate={{
            x: [0, -60, 40, 0],
            y: [0, 70, -50, 0],
            scale: [1, 0.8, 1.2, 1]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
          style={{ top: '30%', right: '10%' }}
        />
        
        {/* 底部光晕 */}
        <motion.div
          className="absolute w-full h-40 bg-gradient-to-t from-purple-900/40 to-transparent"
          style={{ bottom: 0 }}
          animate={{
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* 顶部光晕 */}
        <motion.div
          className="absolute w-full h-40 bg-gradient-to-b from-blue-900/30 to-transparent"
          style={{ top: 0 }}
          animate={{
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        
        {/* 星空效果 */}
        <div className="absolute inset-0">
          {[...Array(40)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1.2, 0.5]
              }}
              transition={{
                duration: Math.random() * 4 + 2,
                repeat: Infinity,
                delay: Math.random() * 6
              }}
            />
          ))}
        </div>
        
        {/* 中心向外扩散的网格 */}
        <motion.div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              radial-gradient(circle at center, rgba(255,255,255,0.2) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
          animate={{
            transform: ['scale(1)', 'scale(1.1)', 'scale(1)']
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <Navigation />
      <HeroSection />
      <ToolsSection />
      <ProjectsSection />
      <AboutSection />
      <ExperienceSection />
      <BlogSection />
      <FAQSection />
      <FooterSection />
    </main>
  );
} 