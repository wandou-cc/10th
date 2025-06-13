'use client';

import { motion } from 'framer-motion';

export default function AboutSection() {
  const skills = [
    'UX Design', 'UI Design', 'Product Design', 'Consulting', 'Design Systems',
    'Front-End Development', 'Workshops', 'Design Sprint', 'Interaction Design',
    'User Testing', 'Usability Testing', 'UX Research', 'Leadership', 'Mentoring', 'No-Code'
  ];

  return (
    <section className="py-20 px-6 bg-black/10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* About Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Web designer and expert in{' '}
                <span className="text-purple-400">UX/UI Design</span>
              </h2>
              <p className="text-xl text-gray-300 mb-4">
                with over <span className="text-white font-bold">15 years</span> of industry experience.
              </p>
              <p className="text-lg text-gray-400 mb-6">
                Expertise extends to <span className="text-purple-400">Framer Development</span> enabling 
                him to create both aesthetically pleasing and easily implementable designs.
              </p>
              <p className="text-lg text-gray-400">
                Currently works as <span className="text-white font-semibold">Product Designer</span> at FLYR Hospitality
              </p>
            </div>

            {/* Testimonials */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {[
                  "He consistently exceeds our expectations",
                  "I recommend Goran whole-heartedly",
                  "Loved to work with Goran!"
                ].map((quote, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-white/5 border border-white/10 rounded-lg p-4"
                  >
                    <p className="text-gray-300 italic">"{quote}"</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Skills */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-3xl font-bold text-white mb-8">Skills</h3>
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, index) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-full text-gray-300 text-sm hover:bg-white/20 transition-colors cursor-default"
                  >
                    {skill}
                  </motion.span>
                ))}
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: skills.length * 0.05 }}
                  viewport={{ once: true }}
                  className="px-4 py-2 bg-purple-500/20 border border-purple-400/30 rounded-full text-purple-300 text-sm"
                >
                  + More
                </motion.span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 