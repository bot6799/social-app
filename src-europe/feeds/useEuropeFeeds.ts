import {useQuery} from '@tanstack/react-query'

import {EUROPE_SOCIAL_CONFIG} from '#europe/config'

export interface EuropeFeed {
  zone_id: string
  uri: string
  displayName: string
  description: string
  feed_type?: string
}

interface FeedsResponse {
  feeds: EuropeFeed[]
}

const FEEDS_KEYS = {
  all: ['europe', 'feeds'] as const,
  list: ['europe', 'feeds', 'list'] as const,
}

async function fetchEuropeFeeds(): Promise<EuropeFeed[]> {
  const response = await fetch(
    `${EUROPE_SOCIAL_CONFIG.services.zoneFeedGenerator}/feeds`,
  )
  if (!response.ok) {
    throw new Error(`Feed generator error: ${response.statusText}`)
  }
  const data: FeedsResponse = await response.json()
  return data.feeds
}

export function useEuropeFeedsQuery() {
  return useQuery<EuropeFeed[]>({
    queryKey: FEEDS_KEYS.list,
    queryFn: fetchEuropeFeeds,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
