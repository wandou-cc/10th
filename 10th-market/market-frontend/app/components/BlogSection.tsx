'use client';

import { motion } from 'framer-motion';

const blogPosts = [
  {
    title: 'The Benefits of Using Free Framer Templates',
    date: 'Sep 5, 2023'
  },
  {
    title: 'How to Customize Free Framer Templates to Fit Your Brand',
    date: 'Sep 4, 2023'
  },
  {
    title: 'Top 5 Free Framer Templates for Startups',
    date: 'Sep 3, 2023'
  }
];

export default function BlogSection() {
  return (
    <section className="py-20 px-6 bg-black/10">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Blog</h2>
        </motion.div>

        <div className="space-y-6">
          {blogPosts.map((post, index) => (
            <motion.div
              key={post.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
            >
              <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/5 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                    {post.title}
                  </h3>
                  <span className="text-gray-400 text-sm">{post.date}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors">
            View More
          </button>
        </motion.div>
      </div>
    </section>
  );
} 