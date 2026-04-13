import { ProjectBoard } from '@/components/client/ProjectBoard'
import Link from 'next/link'

const MOCK_PROJECTS = [
  { id: '1', title: 'Instagram商品紹介投稿', task_type: 'sns_post', status: 'in_progress' as const, assigned_worker_name: '田中 さくら', deadline: '2026-04-05' },
  { id: '2', title: 'Q1営業資料リニューアル', task_type: 'document', status: 'review' as const, assigned_worker_name: '山本 健太' },
  { id: '3', title: '顧客リストCSV整理', task_type: 'data_entry', status: 'open' as const },
  { id: '4', title: '採用LPリデザイン', task_type: 'lp', status: 'completed' as const, assigned_worker_name: '佐藤 みく' },
  { id: '5', title: 'X（旧Twitter）運用代行', task_type: 'sns_post', status: 'open' as const },
]

export default function DashboardPage() {
  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">案件ボード</h1>
          <p className="text-sm text-slate-500 mt-0.5">5件の案件を管理中</p>
        </div>
        <Link
          href="/post"
          className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          ＋ 新しく発注する
        </Link>
      </div>
      <ProjectBoard projects={MOCK_PROJECTS} />
    </main>
  )
}
