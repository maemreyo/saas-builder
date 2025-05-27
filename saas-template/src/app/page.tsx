export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to SaaS Template</h1>
      <p className="text-xl text-gray-600 mb-8">Build your SaaS faster with our production-ready template</p>
      <div className="flex gap-4">
        <a href="/login" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90">
          Get Started
        </a>
        <a href="/docs" className="px-6 py-3 border border-border rounded-lg hover:bg-gray-50">
          Documentation
        </a>
      </div>
    </div>
  )
}
