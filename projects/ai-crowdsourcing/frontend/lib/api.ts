const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(error.detail ?? 'API error')
  }
  return res.json()
}

export const api = {
  createProject: (data: CreateProjectPayload) =>
    request<{ id: string; requirements: Record<string, unknown> }>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMatches: (projectId: string) =>
    request<{ candidates: MatchCandidate[] }>(`/projects/${projectId}/matches`),
  assignWorker: (projectId: string, workerId: string) =>
    request(`/projects/${projectId}/assign?worker_id=${workerId}`, { method: 'PATCH' }),
  authorizePayment: (data: PaymentPayload) =>
    request<{ client_secret: string; payment_intent_id: string }>('/payments/authorize', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  capturePayment: (projectId: string) =>
    request(`/payments/${projectId}/capture`, { method: 'POST' }),
}

export type TaskType = 'sns_post' | 'document' | 'data_entry' | 'lp' | 'other'

export interface CreateProjectPayload {
  title: string
  task_type: TaskType
  raw_input: string
  budget_min?: number
  budget_max?: number
}

export interface MatchCandidate {
  worker_id: string
  display_name: string
  skills: string[]
  skill_score: number
  score: number
}

export interface PaymentPayload {
  project_id: string
  amount: number
  worker_stripe_id: string
}
