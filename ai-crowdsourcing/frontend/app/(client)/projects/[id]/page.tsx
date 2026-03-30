'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { WorkerCard } from '@/components/client/WorkerCard'
import { Button } from '@/components/ui/button'
import { api, MatchCandidate } from '@/lib/api'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [candidates, setCandidates] = useState<MatchCandidate[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAssigning, setIsAssigning] = useState(false)

  useEffect(() => {
    api.getMatches(id)
      .then((res) => setCandidates(res.candidates))
      .finally(() => setIsLoading(false))
  }, [id])

  async function handleAssign() {
    if (!selected) return
    setIsAssigning(true)
    await api.assignWorker(id, selected)
    router.push(`/dashboard`)
  }

  if (isLoading) return (
    <main className="max-w-2xl mx-auto p-6 text-center py-12">
      <div className="text-4xl mb-4">🔍</div>
      <p className="font-medium">AIがマッチング候補を選定中…</p>
    </main>
  )

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AIが選んだ候補者</h1>
        <p className="text-muted-foreground text-sm mt-1">スキル・実績・稼働状況から最適な3名を選定しました</p>
      </div>
      <div className="space-y-4">
        {candidates.map((c, i) => (
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
          {isAssigning ? '依頼中…' : '依頼を確定する →'}
        </Button>
      )}
    </main>
  )
}
