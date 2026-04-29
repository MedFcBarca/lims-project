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
  status: 'Pending' | 'In Analysis' | 'Validated' | 'Rejected'
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