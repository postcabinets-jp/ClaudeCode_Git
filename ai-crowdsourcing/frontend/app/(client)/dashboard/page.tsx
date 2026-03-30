import { ProjectBoard } from '@/components/client/ProjectBoard'
import Link from 'next/link'

const MOCK_PROJECTS = [
  { id: '1', title: 'Instagram商品紹介投稿', task_type: 'sns_post', status: 'in_progress' as const, assigned_worker_name: '田中太郎', deadline: '2026-04-05' },
  { id: '2', title: 'Q1営業資料リニューアル', task_type: 'document', status: 'review' as const, assigned_worker_name: '山田花子' },
  { id: '3', title: '顧客リストCSV整理', task_type: 'data_entry', status: 'open' as const },
]

export default function DashboardPage() {
  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">進行中の案件</h1>
        <Link href="/post" className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90">＋ 新しく発注する</Link>
      </div>
      <ProjectBoard projects={MOCK_PROJECTS} />
    </main>
  )
}
