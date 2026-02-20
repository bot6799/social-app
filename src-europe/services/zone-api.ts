import {EUROPE_SOCIAL_CONFIG} from '#europe/config'

export interface Zone {
  id: string
  name: string
  name_local: string | null
  level: string
  parent_id: string | null
  population: number | null
  timezone: string | null
  languages: string[]
  extra_data: Record<string, unknown>
  created_at: string
  updated_at?: string
}

export interface ZoneResolution {
  zone: Zone
  chain: Zone[]
}

export interface UserHomeZone {
  did: string
  zone_id: string
  verified: boolean
  verified_at: string | null
  set_at: string
  updated_at: string
}

export interface ZoneHierarchy extends Zone {
  children: ZoneHierarchy[]
}

export interface ZoneFeedInfo {
  zone_id: string
  feed_uri: string
  display_name: string
}

export interface SidebarIncident {
  id: string
  title: string | null
  incident_type: string
  severity: string
  status: string
  zone_id: string | null
  reporter_count: number
  last_updated_at: string | null
}

export interface SidebarData {
  home_zone: Zone | null
  zone_tree: ZoneHierarchy[]
  active_incidents: SidebarIncident[]
  zone_feeds: ZoneFeedInfo[]
}

class ZoneAPI {
  private baseUrl: string

  constructor(baseUrl = EUROPE_SOCIAL_CONFIG.services.zone) {
    this.baseUrl = baseUrl
  }

  async getHierarchy(parentId?: string): Promise<Zone[]> {
    const url = parentId
      ? `${this.baseUrl}/zones/hierarchy?parent_id=${encodeURIComponent(parentId)}`
      : `${this.baseUrl}/zones/hierarchy`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Zone API error: ${response.statusText}`)
    }
    return response.json()
  }

  async getZone(id: string): Promise<Zone> {
    const response = await fetch(`${this.baseUrl}/zones/${id}`)
    if (!response.ok) {
      throw new Error(`Zone API error: ${response.statusText}`)
    }
    return response.json()
  }

  async resolveLocation(lat: number, lng: number): Promise<ZoneResolution> {
    const response = await fetch(
      `${this.baseUrl}/zones/resolve?lat=${lat}&lng=${lng}`,
    )
    if (!response.ok) {
      throw new Error(`Zone API error: ${response.statusText}`)
    }
    return response.json()
  }

  async searchZones(query: string, limit = 10): Promise<Zone[]> {
    const response = await fetch(
      `${this.baseUrl}/zones/search?q=${encodeURIComponent(query)}&limit=${limit}`,
    )
    if (!response.ok) {
      throw new Error(`Zone API error: ${response.statusText}`)
    }
    return response.json()
  }

  async setHomeZone(
    did: string,
    zoneId: string,
    verified = false,
  ): Promise<UserHomeZone> {
    const response = await fetch(`${this.baseUrl}/zones/set-home`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({did, zone_id: zoneId, verified}),
    })
    if (!response.ok) {
      throw new Error(`Zone API error: ${response.statusText}`)
    }
    return response.json()
  }

  async getUserHomeZone(did: string): Promise<UserHomeZone | null> {
    const response = await fetch(`${this.baseUrl}/zones/user/${did}/home`)
    if (response.status === 404) return null
    if (!response.ok) {
      throw new Error(`Zone API error: ${response.statusText}`)
    }
    return response.json()
  }

  async getZoneStats(
    zoneId: string,
  ): Promise<{post_count: number; active_users: number}> {
    const response = await fetch(`${this.baseUrl}/zones/${zoneId}/stats`)
    if (!response.ok) {
      throw new Error(`Zone API error: ${response.statusText}`)
    }
    return response.json()
  }

  async getSidebar(did?: string): Promise<SidebarData> {
    const url = did
      ? `${this.baseUrl}/sidebar?did=${encodeURIComponent(did)}`
      : `${this.baseUrl}/sidebar`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Zone API error: ${response.statusText}`)
    }
    return response.json()
  }
}

export const zoneAPI = new ZoneAPI()
