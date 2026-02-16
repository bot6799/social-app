import {useQuery} from '@tanstack/react-query'

import {type Incident, incidentAPI} from '#europe/services/incident-api'
import {translationAPI} from '#europe/services/translation-api'
import {type SidebarData, type Zone, zoneAPI} from '#europe/services/zone-api'

// Query keys
export const ZONE_KEYS = {
  all: ['europe', 'zones'] as const,
  hierarchy: (parentId?: string) =>
    [...ZONE_KEYS.all, 'hierarchy', parentId] as const,
  detail: (id: string) => [...ZONE_KEYS.all, 'detail', id] as const,
  userHome: (did: string) => [...ZONE_KEYS.all, 'userHome', did] as const,
  stats: (id: string) => [...ZONE_KEYS.all, 'stats', id] as const,
  sidebar: (did?: string) => [...ZONE_KEYS.all, 'sidebar', did] as const,
}

export const INCIDENT_KEYS = {
  all: ['europe', 'incidents'] as const,
  list: (params?: {zone_id?: string; status?: string}) =>
    [...INCIDENT_KEYS.all, 'list', params] as const,
  detail: (id: string) => [...INCIDENT_KEYS.all, 'detail', id] as const,
  map: (bbox: [number, number, number, number]) =>
    [...INCIDENT_KEYS.all, 'map', bbox] as const,
}

export const TRANSLATION_KEYS = {
  languages: ['europe', 'translation', 'languages'] as const,
  stats: ['europe', 'translation', 'stats'] as const,
}

// Zone queries
export function useZoneHierarchyQuery(parentId?: string) {
  return useQuery<Zone[]>({
    queryKey: ZONE_KEYS.hierarchy(parentId),
    queryFn: () => zoneAPI.getHierarchy(parentId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useZoneQuery(id: string) {
  return useQuery<Zone>({
    queryKey: ZONE_KEYS.detail(id),
    queryFn: () => zoneAPI.getZone(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function useUserHomeZoneQuery(did: string) {
  return useQuery({
    queryKey: ZONE_KEYS.userHome(did),
    queryFn: () => zoneAPI.getUserHomeZone(did),
    staleTime: 60 * 1000, // 1 minute
    enabled: !!did,
  })
}

export function useZoneStatsQuery(zoneId: string) {
  return useQuery({
    queryKey: ZONE_KEYS.stats(zoneId),
    queryFn: () => zoneAPI.getZoneStats(zoneId),
    staleTime: 30 * 1000, // 30 seconds
    enabled: !!zoneId,
  })
}

export function useSidebarQuery(did?: string) {
  return useQuery<SidebarData>({
    queryKey: ZONE_KEYS.sidebar(did),
    queryFn: () => zoneAPI.getSidebar(did),
    staleTime: 60 * 1000, // 1 minute
  })
}

// Incident queries
export function useIncidentsQuery(params?: {
  zone_id?: string
  status?: string
}) {
  return useQuery<Incident[]>({
    queryKey: INCIDENT_KEYS.list(params),
    queryFn: () => incidentAPI.getIncidents(params as any),
    staleTime: 15 * 1000, // 15 seconds - incidents update frequently
  })
}

export function useIncidentQuery(id: string) {
  return useQuery<Incident>({
    queryKey: INCIDENT_KEYS.detail(id),
    queryFn: () => incidentAPI.getIncident(id),
    staleTime: 15 * 1000,
    enabled: !!id,
  })
}

export function useIncidentMapQuery(bbox: [number, number, number, number]) {
  return useQuery({
    queryKey: INCIDENT_KEYS.map(bbox),
    queryFn: () => incidentAPI.getIncidentMap(bbox),
    staleTime: 15 * 1000,
    enabled: bbox.every(v => v !== 0),
  })
}

// Translation queries
export function useSupportedLanguagesQuery() {
  return useQuery({
    queryKey: TRANSLATION_KEYS.languages,
    queryFn: () => translationAPI.getSupportedLanguages(),
    staleTime: 60 * 60 * 1000, // 1 hour - languages don't change often
  })
}
