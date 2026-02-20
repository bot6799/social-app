import {EUROPE_SOCIAL_CONFIG} from '#europe/config'

export type IncidentType =
  | 'protest'
  | 'emergency'
  | 'infrastructure'
  | 'weather'
  | 'political'
  | 'cultural'
  | 'sports'
  | 'other'

export type IncidentSeverity = 'critical' | 'major' | 'minor' | 'info'

export type IncidentStatus =
  | 'unverified'
  | 'crowdsourced'
  | 'journalist'
  | 'official'
  | 'closed'

export interface Incident {
  id: string
  title: string | null
  description: string | null
  incident_type: IncidentType
  severity: IncidentSeverity
  status: IncidentStatus
  zone_id: string | null
  location_lat: number
  location_lng: number
  geohash: string | null
  reporter_count: number
  first_reported_at: string
  last_updated_at: string
  verified_at: string | null
  verified_by: string | null
  closed_at: string | null
  post_uris: string[]
  extra_data: Record<string, unknown>
  created_at: string
}

export interface IncidentGeoJSON {
  type: 'FeatureCollection'
  features: Array<{
    type: 'Feature'
    geometry: {
      type: 'Point'
      coordinates: [number, number]
    }
    properties: Incident
  }>
}

class IncidentAPI {
  private baseUrl: string

  constructor(baseUrl = EUROPE_SOCIAL_CONFIG.services.incident) {
    this.baseUrl = baseUrl
  }

  async getIncidents(params?: {
    zone_id?: string
    status?: IncidentStatus
    incident_type?: IncidentType
  }): Promise<Incident[]> {
    const searchParams = new URLSearchParams()
    if (params?.zone_id) searchParams.append('zone_id', params.zone_id)
    if (params?.status) searchParams.append('status', params.status)
    if (params?.incident_type)
      searchParams.append('incident_type', params.incident_type)

    const url = `${this.baseUrl}/incidents?${searchParams}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Incident API error: ${response.statusText}`)
    }
    return response.json()
  }

  async getIncident(id: string): Promise<Incident> {
    const response = await fetch(`${this.baseUrl}/incidents/${id}`)
    if (!response.ok) {
      throw new Error(`Incident API error: ${response.statusText}`)
    }
    return response.json()
  }

  async getIncidentMap(
    bbox: [number, number, number, number],
  ): Promise<IncidentGeoJSON> {
    const [minLng, minLat, maxLng, maxLat] = bbox
    const response = await fetch(
      `${this.baseUrl}/incidents/map?bbox=${minLng},${minLat},${maxLng},${maxLat}`,
    )
    if (!response.ok) {
      throw new Error(`Incident API error: ${response.statusText}`)
    }
    return response.json()
  }

  async verifyIncident(
    incidentId: string,
    did: string,
    isValid: boolean,
  ): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/incidents/${incidentId}/verify`,
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({did, is_valid: isValid}),
      },
    )
    if (!response.ok) {
      throw new Error(`Incident API error: ${response.statusText}`)
    }
  }

  subscribeLive(
    zoneId: string,
    onMessage: (incident: Incident) => void,
  ): () => void {
    const wsProtocol = this.baseUrl.startsWith('https') ? 'wss' : 'ws'
    const ws = new WebSocket(
      `${wsProtocol}://${new URL(this.baseUrl).host}/incidents/live?zone_id=${encodeURIComponent(zoneId)}`,
    )

    ws.onmessage = event => {
      const data = JSON.parse(event.data)
      onMessage(data)
    }

    return () => ws.close()
  }
}

export const incidentAPI = new IncidentAPI()
