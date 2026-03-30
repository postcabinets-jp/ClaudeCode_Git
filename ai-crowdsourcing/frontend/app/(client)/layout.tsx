export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <span className="font-bold text-lg">AI発注</span>
        <a href="/dashboard" className="text-sm text-slate-600 hover:text-slate-900">ダッシュボード</a>
      </nav>
      {children}
    </div>
  )
}
