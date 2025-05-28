'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { motion } from 'framer-motion'

const testimonials = [
  {
    name: 'Alex Chen',
    role: 'Founder',
    company: 'TechStart',
    avatar: '/avatars/alex.jpg',
    content: 'This template saved me 3 months of development time. The authentication system and billing integration work flawlessly out of the box.',
    rating: 5,
  },
  {
    name: 'Sarah Johnson',
    role: 'CTO',
    company: 'DataFlow',
    avatar: '/avatars/sarah.jpg',
    content: 'Incredible attention to detail and code quality. The team management features are exactly what we needed for our B2B SaaS.',
    rating: 5,
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Lead Developer',
    company: 'CloudSync',
    avatar: '/avatars/marcus.jpg',
    content: 'The documentation is outstanding and the code is clean and well-organized. Made scaling our application so much easier.',
    rating: 5,
  },
  {
    name: 'Emily Watson',
    role: 'Product Manager',
    company: 'InnovateLab',
    avatar: '/avatars/emily.jpg',
    content: 'Best investment for our startup. The admin dashboard and analytics features helped us understand our users better.',
    rating: 5,
  },
  {
    name: 'David Kim',
    role: 'Solo Founder',
    company: 'QuickLaunch',
    avatar: '/avatars/david.jpg',
    content: 'As a solo founder, this template was a game-changer. I could focus on my core product instead of rebuilding common features.',
    rating: 5,
  },
  {
    name: 'Lisa Park',
    role: 'Engineering Manager',
    company: 'ScaleUp',
    avatar: '/avatars/lisa.jpg',
    content: 'The multi-tenant architecture and security features are production-ready. Saved us months of architecture planning.',
    rating: 5,
  },
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

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4">
            Testimonials
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Loved by{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Developers
            </span>{' '}
            Worldwide
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Don't take our word for it. Here's what our customers say about the template.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Icons.star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Testimonial Content */}
                  <blockquote className="text-gray-700 mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-2">1000+</div>
            <div className="text-gray-600">Happy Customers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-2">50+</div>
            <div className="text-gray-600">Countries</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-2">4.9/5</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-2">24/7</div>
            <div className="text-gray-600">Support</div>
          </div>
        </div>
      </div>
    </section>
  )
}