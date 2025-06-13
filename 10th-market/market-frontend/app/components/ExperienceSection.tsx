'use client';

import { motion } from 'framer-motion';

const experiences = [
  {
    title: 'Design Lead',
    company: 'Geonode',
    period: 'Jan 2020 - Jan 2023',
    current: false
  },
  {
    title: 'Lead UX/UI Designer',
    company: 'Truely',
    period: 'Jan 2018 - Jan 2020',
    current: false
  },
  {
    title: 'Senior Product Designer',
    company: 'Nicey Consulting',
    period: 'Jun 2016 - Present',
    current: true
  },
  {
    title: 'Co-Founder',
    company: 'BrandingMag',
    period: 'Jan 2011 - Jun 2015',
    current: false
  }
];

export default function ExperienceSection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Experience</h2>
        </motion.div>

        <div className="space-y-8">
          {experiences.map((exp, index) => (
            <motion.div
              key={`${exp.company}-${exp.title}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/5 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">
                      {exp.title}
                    </h3>
                    <p className="text-xl text-purple-400 font-semibold">{exp.company}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 font-medium">{exp.period}</span>
                    {exp.current && (
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                        Current
                      </span>
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