'use client';

import { motion } from 'framer-motion';

const projects = [
  {
    title: 'Modernizing a Subscription Management Platform',
    description: 'With user-centered approach, the goals was to create an intuitive interface for effortless financial management while incorporating gamification.',
    engagement: '12 min',
    satisfaction: '4.5*',
    metrics: { label: 'Engagement', value: '12 min' },
    status: 'completed'
  },
  {
    title: 'Revamping an E-Commerce Website',
    description: 'Focus was to create a user-friendly interface that simplified the process of accessing premium operational web scraping proxies.',
    usability: '85%',
    retention: '70%',
    metrics: { label: 'Usability', value: '85%' },
    status: 'completed'
  },
  {
    title: 'Developing a Mobile Health Tracking App',
    description: 'Leading Bitcoin Data and Stats site. Live price action, monitor on-chain data, and track key economic indicators.',
    conversion: '12%',
    satisfaction: '4.8*',
    metrics: { label: 'Conversion Rate', value: '12%' },
    status: 'completed'
  },
  {
    title: 'Optimizing a Corporate Intranet',
    description: 'An innovative app and approach for taking advantage of unused internet from people\'s devices. It differs from others because of its simplicity, functions, and ways to earn extra money.',
    conversion: '20%',
    satisfaction: '95%',
    metrics: { label: 'Conversion Rate', value: '20%' },
    status: 'coming-soon'
  }
];

export default function ProjectsSection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Featured Projects</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Showcasing impactful design solutions that drive results
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-8 h-full hover:bg-white/5 transition-all duration-300">
                {/* Project Image Placeholder */}
                <div className="w-full h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl mb-6 flex items-center justify-center">
                  <div className="text-white/30 text-6xl">🎨</div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                    {project.title}
                  </h3>
                  
                  <p className="text-gray-400 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex gap-6">
                      <div>
                        <p className="text-gray-500 text-sm">{project.metrics.label}</p>
                        <p className="text-white font-semibold">{project.metrics.value}</p>
                      </div>
                      {project.satisfaction && (
                        <div>
                          <p className="text-gray-500 text-sm">User Satisfaction</p>
                          <p className="text-white font-semibold">{project.satisfaction}</p>
                        </div>
                      )}
                    </div>
                    
                    {project.status === 'coming-soon' ? (
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">
                        Coming Soon
                      </span>
                    ) : (
                      <button className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm transition-colors">
                        View case study
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 