export type ConnectionType = 'GIT' | 'FEATURE_FILES' | 'DATABASE_SCHEMA' | 'DOCS'
export type RunStatus = 'QUEUED' | 'INGESTING' | 'ANALYZING' | 'COMPLETED' | 'FAILED'

export interface CreateProjectRequest {
  name: string
  description?: string
}

export interface ProjectResponse {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  sourceConnections: SourceConnectionResponse[]
}

export interface SourceConnectionResponse {
  id: string
  type: ConnectionType
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR'
  lastSyncedAt?: string
  configJson?: string
  metadataJson?: string
}

export interface SourceConnectionRequest {
  type: ConnectionType
  configJson: string
  metadataJson?: string
}

export interface SourceValidationResponse {
  type: ConnectionType
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR'
  message: string
  metadataJson: string
}

export interface CreateAnalysisRunRequest {
  projectId: string
  jiraContent: string
  featureContent?: string
}

export interface GenerateFeatureFileRequest {
  jiraContent: string
}

export interface GenerateFeatureFileResponse {
  featureContent: string
}

export interface AnalysisRunResponse {
  id: string
  projectId: string
  status: RunStatus
  jiraTicketId?: string
  errorMessage?: string
  createdAt: string
  startedAt?: string
  completedAt?: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? '/api' : '')
export const BACKEND_CONFIGURED = import.meta.env.DEV || Boolean(import.meta.env.VITE_API_BASE_URL)

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = API_BASE_URL.replace(/\/$/, '')
  const requestUrl = baseUrl
    ? baseUrl.endsWith('/api') && path.startsWith('/api/')
      ? `${baseUrl.slice(0, -4)}${path}`
      : `${baseUrl}${path}`
    : path

  let response: Response
  try {
    response = await fetch(requestUrl, {
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      ...init,
    })
  } catch {
    const locationHint = baseUrl || 'the current deployment origin'
    throw new Error(
      `Unable to reach the backend at ${locationHint}. Set VITE_API_BASE_URL to your Spring Boot server or expose the API from the same origin.`,
    )
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`
    try {
      const payload = (await response.json()) as { detail?: string; message?: string }
      message = payload.detail ?? payload.message ?? message
    } catch {
      // Keep generic message when response body is not JSON.
    }
    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export async function createProject(payload: CreateProjectRequest): Promise<ProjectResponse> {
  return request<ProjectResponse>('/api/projects', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function upsertProjectSources(projectId: string, sources: SourceConnectionRequest[]): Promise<ProjectResponse> {
  return request<ProjectResponse>(`/api/projects/${projectId}/sources`, {
    method: 'PUT',
    body: JSON.stringify(sources),
  })
}

export async function getProject(projectId: string): Promise<ProjectResponse> {
  return request<ProjectResponse>(`/api/projects/${projectId}`)
}

export async function createAnalysisRun(payload: CreateAnalysisRunRequest): Promise<AnalysisRunResponse> {
  return request<AnalysisRunResponse>('/api/analysis-runs', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function validateSourceConnection(payload: SourceConnectionRequest): Promise<SourceValidationResponse> {
  return request<SourceValidationResponse>('/api/projects/sources/validate', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function generateFeatureFileDraft(payload: GenerateFeatureFileRequest): Promise<GenerateFeatureFileResponse> {
  return request<GenerateFeatureFileResponse>('/api/feature-files/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getAnalysisRun(runId: string): Promise<AnalysisRunResponse> {
  return request<AnalysisRunResponse>(`/api/analysis-runs/${runId}`)
}

export async function getReportByRunId<TReport>(runId: string): Promise<TReport> {
  return request<TReport>(`/api/reports/${runId}`)
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export async function waitForRunCompletion(
  runId: string,
  opts?: { pollIntervalMs?: number; timeoutMs?: number },
): Promise<AnalysisRunResponse> {
  const pollIntervalMs = opts?.pollIntervalMs ?? 1500
  const timeoutMs = opts?.timeoutMs ?? 180000
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    const run = await getAnalysisRun(runId)

    if (run.status === 'COMPLETED') {
      return run
    }
    if (run.status === 'FAILED') {
      throw new Error(run.errorMessage || 'Analysis failed on backend')
    }

    await delay(pollIntervalMs)
  }

  throw new Error('Analysis timed out while waiting for completion')
}
