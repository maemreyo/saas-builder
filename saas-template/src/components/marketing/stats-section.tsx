'use client'

import { motion } from 'framer-motion'

const stats = [
  {
    value: '1000+',
    label: 'Developers Using',
    description: 'Growing community of developers'
  },
  {
    value: '3 months',
    label: 'Time Saved',
    description: 'Average development time saved'
  },
  {
    value: '99.9%',
    label: 'Uptime',
    description: 'Reliable and stable infrastructure'
  },
  {
    value: '50+',
    label: 'Features',
    description: 'Ready-to-use components and features'
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
}

export function StatsSection() {
  return (
    <section className="py-16 bg-white border-b">
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
              <div className="text-sm font-semibold text-gray-700 mb-1">
                {stat.label}
              </div>
              <div className="text-xs text-gray-500">
                {stat.description}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}