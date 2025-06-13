'use client';

import { motion } from 'framer-motion';

export default function FooterSection() {
  return (
    <footer className="py-20 px-6 bg-black/20">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          {/* CTA Section */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Upgrade your web presence with Framer
            </h2>
            <p className="text-xl text-gray-400">
              Goran Babarogic - Framer Developer
            </p>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-6">
            {[
              { name: 'LinkedIn', icon: '💼' },
              { name: 'Mail', icon: '✉️' },
              { name: 'Website', icon: '🌐' }
            ].map((social, index) => (
              <motion.a
                key={social.name}
                href="#"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.1 }}
                viewport={{ once: true }}
                className="w-12 h-12 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center text-xl hover:bg-white/20 transition-colors"
                title={social.name}
              >
                {social.icon}
              </motion.a>
            ))}
          </div>

          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="pt-8 border-t border-white/10"
          >
            <p className="text-gray-500">
              Nicey Studio © Goran Babarogic 2023
            </p>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
} 