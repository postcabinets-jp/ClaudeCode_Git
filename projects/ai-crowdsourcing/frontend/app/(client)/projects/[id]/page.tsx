'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { WorkerCard } from '@/components/client/WorkerCard'
import { Button } from '@/components/ui/button'
import { MatchCandidate } from '@/lib/api'

const MOCK_CANDIDATES: MatchCandidate[] = [
  {
    worker_id: 'w-001',
    display_name: '田中 さくら',
    skills: ['Instagram運用', 'Canva', 'コピーライティング', 'SNS広告'],
    skill_score: 4.8,
    score: 0.95,
  },
  {
    worker_id: 'w-002',
    display_name: '山本 健太',
    skills: ['SNS投稿', 'Adobe', '写真編集', 'ブランディング'],
    skill_score: 4.5,
    score: 0.87,
  },
  {
    worker_id: 'w-003',
    display_name: '佐藤 みく',
    skills: ['SNS運用', 'デザイン', 'ライティング'],
    skill_score: 4.1,
    score: 0.79,
  },
]

export default function ProjectDetailPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [isAssigning, setIsAssigning] = useState(false)

  function handleAssign() {
    if (!selected) return
    setIsAssigning(true)
    // デモ: 1秒後にダッシュボードへ
    setTimeout(() => router.push('/dashboard'), 1000)
  }

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <p className="text-xs text-blue-600 font-medium mb-1">✨ AIマッチング完了</p>
        <h1 className="text-2xl font-bold">AIが選んだ候補者</h1>
        <p className="text-muted-foreground text-sm mt-1">スキル・実績・稼働状況から最適な3名を選定しました</p>
      </div>

      <div className="space-y-4">
        {MOCK_CANDIDATES.map((c, i) => (
          <WorkerCard
            key={c.worker_id}
            candidate={c}
            rank={i + 1}
            onSelect={setSelected}
            isSelected={selected === c.worker_id}
          />
        ))}
      </div>

      {selected && (
        <Button className="w-full" size="lg" onClick={handleAssign} disabled={isAssigning}>
          {isAssigning ? '依頼を送信中…' : '依頼を確定する →'}
        </Button>
      )}
    </main>
  )
}
