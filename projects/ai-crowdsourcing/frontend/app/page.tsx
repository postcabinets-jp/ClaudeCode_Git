import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-10 text-center">
        <div className="space-y-3">
          <div className="text-5xl">🤖</div>
          <h1 className="text-4xl font-bold tracking-tight">AI発注プラットフォーム</h1>
          <p className="text-lg text-slate-500">
            依頼内容を話すだけ。AIが要件を整理して最適な人材を自動マッチング。
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          {[
            { icon: '✍️', label: 'Step 1', desc: 'やりたいことを入力' },
            { icon: '🔍', label: 'Step 2', desc: 'AIが候補者を選定' },
            { icon: '✅', label: 'Step 3', desc: '1クリックで依頼確定' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm space-y-1">
              <div className="text-2xl">{s.icon}</div>
              <div className="font-semibold text-slate-400 text-xs">{s.label}</div>
              <div className="font-medium">{s.desc}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <Link
            href="/post"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-full transition-colors"
          >
            ＋ 発注してみる
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-8 py-3 rounded-full border border-slate-200 transition-colors"
          >
            ダッシュボードを見る
          </Link>
        </div>

        <p className="text-xs text-slate-400">※ デモモード — APIなしで全画面を確認できます</p>
      </div>
    </main>
  )
}
