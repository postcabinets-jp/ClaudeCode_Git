import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MatchCandidate } from '@/lib/api'

interface WorkerCardProps {
  candidate: MatchCandidate
  rank: number
  onSelect: (workerId: string) => void
  isSelected: boolean
}

export function WorkerCard({ candidate, rank, onSelect, isSelected }: WorkerCardProps) {
  const scorePercent = Math.round(candidate.score * 100)
  const rankColors = ['bg-yellow-400', 'bg-gray-300', 'bg-amber-600']

  return (
    <Card className={`transition-all ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'hover:border-blue-300'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${rankColors[rank - 1] ?? 'bg-slate-400'}`}>
            {rank}
          </div>
          <div>
            <p className="font-semibold">{candidate.display_name}</p>
            <p className="text-xs text-muted-foreground">適合度 {scorePercent}%</p>
          </div>
          <div className="ml-auto">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-600">
              {scorePercent}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1">
          {candidate.skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
          ))}
        </div>
        <Button
          className="w-full"
          variant={isSelected ? 'default' : 'outline'}
          onClick={() => onSelect(candidate.worker_id)}
        >
          {isSelected ? '✓ この人に決める' : 'この人に依頼する'}
        </Button>
      </CardContent>
    </Card>
  )
}
