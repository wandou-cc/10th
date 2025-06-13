'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const faqs = [
  {
    question: 'What is your design process?',
    answer: 'My design process follows a user-centered approach starting with research, ideation, prototyping, testing, and iteration. I believe in involving stakeholders throughout the process to ensure the final product meets both user needs and business objectives.'
  },
  {
    question: 'What tools and software do you use for UX design?',
    answer: 'I primarily use Figma for design and prototyping, Framer for interactive prototypes and websites, Notion for documentation, and various user research tools like Hotjar for analytics and user behavior tracking.'
  },
  {
    question: 'How do you measure the success of your UX designs?',
    answer: 'Success is measured through various metrics including user satisfaction scores, task completion rates, conversion rates, user engagement metrics, and qualitative feedback from user testing sessions. I also track business metrics to ensure designs drive meaningful results.'
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Frequently asked questions
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-8 py-6 text-left hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-inset"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white pr-4">
                    {faq.question}
                  </h3>
                  <ChevronDownIcon 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>
              
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-8 pb-6"
                >
                  <p className="text-gray-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 