export type Client = {
  id: number
  name: string
  email: string
  domain: string
  createdAt: string
}

export type Sample = {
  id: number
  code: string
  type: string
  status: 'Received' | 'InProgress' | 'Completed' | 'Validated' | 'Rejected'
  clientId: number
  client?: Client
  createdAt: string
}

export type Analysis = {
  id: number
  parameter: string
  value: number
  unit: string
  threshold: number
  isCompliant: boolean
  sampleId: number
}

export type AuditLog = {
  id: number
  action: string
  entityName: string
  entityId: number
  oldValue?: string | null
  newValue?: string | null
  user: string
  comment?: string | null
  createdAt: string
}