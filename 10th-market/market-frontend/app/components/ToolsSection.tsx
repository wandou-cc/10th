'use client';

import { motion } from 'framer-motion';

const tools = [
  { name: 'Spline', description: 'Place to design and collaborate in 3D', icon: '🎲' },
  { name: 'Figma', description: 'Design tool for creating and collaborating', icon: '🎨' },
  { name: 'Framer', description: 'Framer is where teams design and publish stunning sites.', icon: '⚡' },
  { name: 'Relume', description: 'Access the world\'s largest library of Figma', icon: 'R' },
  { name: 'Webflow', description: 'Take control of HTML, CSS, and JavaScript in a visual canvas.', icon: 'W' },
  { name: 'Hotjar', description: 'Behaviour analytical tool to track users', icon: '🔥' },
  { name: 'Notion', description: 'Wiki, docs and projects management system', icon: 'N' },
  { name: 'Fireflies AI', description: 'AI Notetaker for Meetings', icon: '🪰' },
];

export default function ToolsSection() {
  return (
    <section className="py-20 px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6"
        >
          {tools.map((tool, index) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-6 h-full hover:bg-white/5 transition-all duration-300">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-lg">
                    {tool.icon}
                  </div>
                  <h3 className="text-white font-semibold text-lg">{tool.name}</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{tool.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
} 