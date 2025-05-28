'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { motion } from 'framer-motion'

const features = [
  {
    icon: Icons.shield,
    title: 'Authentication & Security',
    description: 'Complete auth system with OAuth, 2FA, session management, and role-based access control.',
    items: ['Email/Password Auth', 'Google & GitHub OAuth', 'Two-Factor Authentication', 'Role-Based Access'],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Icons.creditCard,
    title: 'Billing & Payments',
    description: 'Stripe integration with subscriptions, invoicing, and payment method management.',
    items: ['Stripe Subscriptions', 'Invoice Generation', 'Payment Methods', 'Webhook Handling'],
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Icons.users,
    title: 'Team Management',
    description: 'Organization system with member roles, invitations, and collaborative features.',
    items: ['Organizations', 'Member Roles', 'Team Invitations', 'Access Control'],
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Icons.database,
    title: 'Database & Storage',
    description: 'Supabase integration with type-safe queries, RLS policies, and file storage.',
    items: ['Supabase Database', 'Type-Safe Queries', 'Row Level Security', 'File Storage'],
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: Icons.mail,
    title: 'Email System',
    description: 'Transactional emails with beautiful templates and automated workflows.',
    items: ['Welcome Emails', 'Password Reset', 'Team Invitations', 'Billing Notifications'],
    color: 'from-teal-500 to-blue-500'
  },
  {
    icon: Icons.settings,
    title: 'Admin Dashboard',
    description: 'Comprehensive admin interface for user management and system monitoring.',
    items: ['User Management', 'System Analytics', 'Activity Logs', 'Settings Panel'],
    color: 'from-indigo-500 to-purple-500'
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

export function FeaturesSection() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4">
            Features
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Ship Fast
            </span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Don't reinvent the wheel. Our template includes all the essential features
            you need to build and scale your SaaS product.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 shadow-md group">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center gap-2 text-sm text-gray-600">
                        <Icons.check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Technical Stack */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold mb-8">Built with Modern Tech Stack</h3>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {[
              'Next.js 14',
              'React 18',
              'TypeScript',
              'Tailwind CSS',
              'Supabase',
              'Stripe',
              'Resend',
              'Framer Motion'
            ].map((tech) => (
              <div key={tech} className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium">
                {tech}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}