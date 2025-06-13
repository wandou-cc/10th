import { motion } from 'framer-motion';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';

export default function HeroSection() {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 加密货币数据
  const cryptoCoins = [
    { name: 'Bitcoin', symbol: 'BTC', icon: '₿', color: 'from-orange-400 to-yellow-500' },
    { name: 'Ethereum', symbol: 'ETH', icon: 'Ξ', color: 'from-blue-400 to-purple-500' },
    { name: 'Cardano', symbol: 'ADA', icon: '₳', color: 'from-blue-500 to-indigo-600' },
    { name: 'Polkadot', symbol: 'DOT', icon: '●', color: 'from-pink-400 to-red-500' },
    { name: 'Chainlink', symbol: 'LINK', icon: '⬢', color: 'from-blue-400 to-cyan-500' },
    { name: 'Solana', symbol: 'SOL', icon: '◎', color: 'from-purple-400 to-pink-500' },
    { name: 'Avalanche', symbol: 'AVAX', icon: '▲', color: 'from-red-400 to-rose-500' },
    { name: 'Polygon', symbol: 'MATIC', icon: '⬟', color: 'from-purple-500 to-indigo-600' }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  const getAnimationDelay = (index: number) => {
    try {
      return Math.max(0, 1.4 + (index || 0) * 0.15);
    } catch (error) {
      console.warn('Animation delay calculation error:', error);
      return 1.4;
    }
  };

  if (isLoading) {
    return (
      <section className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
      </section>
    );
  }

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-20">
      <div className="max-w-4xl mx-auto text-center">
        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6"
        >
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 p-1">
              <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {imageError ? (
                  <div className="w-full h-full bg-gray-400 flex items-center justify-center text-gray-600">
                    👤
                  </div>
                ) : (
                  <img 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    loading="lazy"
                  />
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Verified Expert Badge - 移到头像下面 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-sm font-medium text-white mb-8"
        >
          <CheckBadgeIcon className="w-5 h-5 text-blue-400" />
          Verified Expert
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
        >
          Designed for <span className="text-gray-400">Designers</span>{' '}
          <span className="text-gray-400">to showcase their work</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Helping startups and brands to craft expressive and engaging solutions for their software needs.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
        >
          <button 
            className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            onClick={() => {
              try {
                console.log('Remix Template clicked');
              } catch (error) {
                console.error('Button click error:', error);
              }
            }}
          >
            Remix Template
          </button>
          <button 
            className="border border-white/30 text-white px-8 py-3 rounded-full font-medium hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            onClick={() => {
              try {
                console.log('Get Athos Plus clicked');
              } catch (error) {
                console.error('Button click error:', error);
              }
            }}
          >
            Get Athos Plus
          </button>
        </motion.div>

        {/* 加密货币轮播区域 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="relative overflow-hidden"
        >
          <h3 className="text-xl font-semibold text-white mb-8">Supported Cryptocurrencies</h3>
          
          <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
            {cryptoCoins.map((coin, index) => (
              <motion.div
                key={`${coin.symbol}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: getAnimationDelay(index),
                  repeat: Infinity,
                  repeatType: "reverse",
                  repeatDelay: 3
                }}
                whileHover={{ 
                  scale: 1.15,
                  rotateY: 180,
                  transition: { duration: 0.3 }
                }}
                className={`relative w-20 h-20 bg-gradient-to-br ${coin.color} rounded-2xl flex flex-col items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300`}
                title={`${coin.name} (${coin.symbol})`}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    console.log(`${coin.name} selected`);
                  }
                }}
                onClick={() => {
                  try {
                    console.log(`${coin.name} (${coin.symbol}) clicked`);
                  } catch (error) {
                    console.error('Coin click error:', error);
                  }
                }}
              >
                {/* 币种图标 */}
                <div className="text-white text-2xl font-bold mb-1">
                  {coin.icon}
                </div>
                
                {/* 币种符号 */}
                <div className="text-white text-xs font-medium opacity-90">
                  {coin.symbol}
                </div>

                {/* 发光效果 */}
                <div className={`absolute inset-0 bg-gradient-to-br ${coin.color} rounded-2xl opacity-0 hover:opacity-20 transition-opacity duration-300`}></div>
                
                {/* 轮播动画指示器 */}
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.3
                  }}
                />
              </motion.div>
            ))}
          </div>

          {/* 轮播指示文字 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 2.0 }}
            className="text-gray-500 text-sm mt-6"
          >
            Real-time market data and trading insights
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
} 