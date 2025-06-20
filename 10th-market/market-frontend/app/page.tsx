'use client';

import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      <HeroSection />
    </main>
  );
} 