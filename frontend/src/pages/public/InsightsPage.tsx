import { BarChart2 } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function InsightsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 font-sans">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <BarChart2 size={48} className="mx-auto text-neutral-200 dark:text-neutral-700 mb-4" />
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Insights</h1>
          <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-2">Coming soon</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
