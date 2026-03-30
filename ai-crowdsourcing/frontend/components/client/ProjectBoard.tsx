'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type ProjectStatus = 'open' | 'matched' | 'in_progress' | 'review' | 'completed'

interface ProjectItem {
  id: string
  title: string
  task_type: string
  status: ProjectStatus
  assigned_worker_name?: string
  deadline?: string
}

const STATUS_COLUMNS: { key: ProjectStatus; label: string; color: string }[] = [
  { key: 'open', label: '依頼中', color: 'bg-blue-50 border-blue-200' },
  { key: 'in_progress', label: '作業中', color: 'bg-yellow-50 border-yellow-200' },
  { key: 'review', label: '確認待ち', color: 'bg-purple-50 border-purple-200' },
  { key: 'completed', label: '完了', color: 'bg-green-50 border-green-200' },
]

const TASK_TYPE_LABELS: Record<string, string> = {
  sns_post: '📱 SNS投稿',
  document: '📄 資料',
  data_entry: '📊 データ入力',
  lp: '🌐 LP制作',
  other: '✨ その他',
}

interface ProjectBoardProps {
  projects: ProjectItem[]
}

export function ProjectBoard({ projects }: ProjectBoardProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {STATUS_COLUMNS.map((col) => {
        const items = projects.filter((p) =>
          col.key === 'open' ? ['open', 'matched'].includes(p.status) : p.status === col.key
        )
        return (
          <div key={col.key} className={`rounded-lg border p-3 ${col.color}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-sm">{col.label}</span>
              <Badge variant="secondary">{items.length}</Badge>
            </div>
            <div className="space-y-2">
              {items.map((project) => (
                <Card key={project.id} className="cursor-pointer hover:shadow-sm transition-shadow">
                  <CardContent className="p-3 space-y-1">
                    <p className="text-xs text-muted-foreground">{TASK_TYPE_LABELS[project.task_type] ?? project.task_type}</p>
                    <p className="text-sm font-medium leading-snug">{project.title}</p>
                    {project.assigned_worker_name && (
                      <p className="text-xs text-muted-foreground">担当: {project.assigned_worker_name}</p>
                    )}
                    {project.deadline && (
                      <p className="text-xs text-orange-600">期限: {new Date(project.deadline).toLocaleDateString('ja-JP')}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
              {items.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">案件なし</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
