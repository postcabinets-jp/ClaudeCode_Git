'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { api, TaskType } from '@/lib/api'

const TASK_OPTIONS: { type: TaskType; label: string; icon: string; example: string }[] = [
  { type: 'sns_post', label: 'SNS投稿', icon: '📱', example: 'Instagramに商品紹介を1投稿お願いします' },
  { type: 'document', label: '資料・文書', icon: '📄', example: '会社紹介用のA4資料を3枚作ってほしい' },
  { type: 'data_entry', label: 'データ入力', icon: '📊', example: 'Excelのデータを整理してCSVにしてほしい' },
  { type: 'lp', label: 'LP・Web制作', icon: '🌐', example: '商品のランディングページを作りたい' },
  { type: 'other', label: 'その他', icon: '✨', example: 'やりたいことを自由に書いてください' },
]

type Step = 'select_type' | 'describe' | 'budget' | 'confirming'

export function PostWizard() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('select_type')
  const [taskType, setTaskType] = useState<TaskType | null>(null)
  const [rawInput, setRawInput] = useState('')
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!taskType) return
    setIsLoading(true)
    setError(null)
    setStep('confirming')
    try {
      const result = await api.createProject({
        title: `${TASK_OPTIONS.find(o => o.type === taskType)?.label} — ${new Date().toLocaleDateString('ja-JP')}`,
        task_type: taskType,
        raw_input: rawInput,
        budget_min: budgetMin ? parseInt(budgetMin) : undefined,
        budget_max: budgetMax ? parseInt(budgetMax) : undefined,
      })
      router.push(`/projects/${result.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : '投稿に失敗しました')
      setStep('budget')
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'select_type') {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">何をお願いしますか？</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {TASK_OPTIONS.map((opt) => (
            <Card
              key={opt.type}
              className="cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => { setTaskType(opt.type); setStep('describe') }}
            >
              <CardContent className="pt-6 text-center">
                <div className="text-3xl mb-2">{opt.icon}</div>
                <div className="font-medium">{opt.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (step === 'describe') {
    const selected = TASK_OPTIONS.find(o => o.type === taskType)!
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">{selected.icon} {selected.label} — 詳しく教えてください</h2>
        <Textarea
          placeholder={selected.example}
          className="min-h-32"
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStep('select_type')}>戻る</Button>
          <Button disabled={rawInput.trim().length < 10} onClick={() => setStep('budget')}>
            次へ
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'budget') {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">予算を教えてください（任意）</h2>
        <div className="flex items-center gap-2">
          <Input placeholder="3,000" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} className="w-32" />
          <span>〜</span>
          <Input placeholder="10,000" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} className="w-32" />
          <span>円</span>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStep('describe')}>戻る</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'AIが要件を整理中…' : '発注する'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-4">⚙️</div>
      <p className="text-lg font-medium">AIが要件を整理しています…</p>
      <p className="text-sm text-muted-foreground mt-2">マッチング候補を探しています</p>
    </div>
  )
}
