import {Pressable, StyleSheet, View} from 'react-native'
import {Trans, msg} from '@lingui/macro'
import {useLingui} from '@lingui/react'

import * as Layout from '#/components/Layout'
import {Text} from '#/components/Typography'
import {useEuropeFeedsQuery, type EuropeFeed} from '#europe/feeds/useEuropeFeeds'

const TYPE_LABELS: Record<string, string> = {
  recommended: 'Recommended',
  latest: 'Latest',
  local: 'Local',
  news: 'News',
  popular: 'Popular',
}

interface ZoneGroup {
  zone_id: string
  displayName: string
  feeds: EuropeFeed[]
}

function groupFeedsByZone(feeds: EuropeFeed[]): ZoneGroup[] {
  const groups = new Map<string, ZoneGroup>()

  for (const feed of feeds) {
    let group = groups.get(feed.zone_id)
    if (!group) {
      // Extract the base zone display name (strip " — Type" suffix)
      const baseName = feed.displayName.includes(' — ')
        ? feed.displayName.split(' — ')[0]
        : feed.displayName
      group = {zone_id: feed.zone_id, displayName: baseName, feeds: []}
      groups.set(feed.zone_id, group)
    }
    group.feeds.push(feed)
  }

  return Array.from(groups.values())
}

function FeedTypeEntry({feed}: {feed: EuropeFeed}) {
  const {_} = useLingui()
  const typeLabel = feed.feed_type
    ? TYPE_LABELS[feed.feed_type] || feed.feed_type
    : 'Recommended'

  return (
    <View style={styles.feedTypeEntry}>
      <View style={styles.feedTypeInfo}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{typeLabel}</Text>
        </View>
        <Text style={styles.feedDescription} numberOfLines={1}>
          {feed.description}
        </Text>
      </View>
      <Pressable
        style={styles.pinButton}
        accessibilityLabel={_(msg`Pin ${feed.displayName} feed`)}
        accessibilityRole="button">
        <Text style={styles.pinButtonText}>
          <Trans>Pin</Trans>
        </Text>
      </Pressable>
    </View>
  )
}

function ZoneCard({group}: {group: ZoneGroup}) {
  const isCity = group.zone_id.includes('-')
  const levelLabel = isCity
    ? 'City'
    : group.zone_id === 'europe'
      ? 'Continent'
      : 'Country'

  return (
    <View style={styles.zoneCard}>
      <View style={styles.zoneHeader}>
        <Text style={styles.zoneName}>{group.displayName}</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{levelLabel}</Text>
        </View>
      </View>
      {group.feeds.map(feed => (
        <FeedTypeEntry key={feed.uri} feed={feed} />
      ))}
    </View>
  )
}

function FeedsLoading() {
  return (
    <View style={styles.centerMessage}>
      <Text style={styles.messageText}>
        <Trans>Loading feeds...</Trans>
      </Text>
    </View>
  )
}

function FeedsError() {
  return (
    <View style={styles.centerMessage}>
      <Text style={styles.messageText}>
        <Trans>
          Could not load zone feeds. Make sure the feed generator service is
          running on port 8002.
        </Trans>
      </Text>
    </View>
  )
}

function FeedsEmpty() {
  return (
    <View style={styles.centerMessage}>
      <Text style={styles.messageText}>
        <Trans>No zone feeds available yet.</Trans>
      </Text>
    </View>
  )
}

export function EuropeFeedsScreen() {
  const {data: feeds, isLoading, error} = useEuropeFeedsQuery()

  const zoneGroups = feeds ? groupFeedsByZone(feeds) : []

  const continentGroups = zoneGroups.filter(g => g.zone_id === 'europe')
  const countryGroups = zoneGroups.filter(
    g => !g.zone_id.includes('-') && g.zone_id !== 'europe',
  )
  const cityGroups = zoneGroups.filter(g => g.zone_id.includes('-'))

  return (
    <Layout.Screen>
      <Layout.Header.Outer>
        <Layout.Header.BackButton />
        <Layout.Header.Content>
          <Layout.Header.TitleText>
            <Trans>Zone Feeds</Trans>
          </Layout.Header.TitleText>
          <Layout.Header.SubtitleText>
            <Trans>Follow feeds from specific zones</Trans>
          </Layout.Header.SubtitleText>
        </Layout.Header.Content>
        <Layout.Header.Slot />
      </Layout.Header.Outer>

      <Layout.Content>
        {isLoading ? (
          <FeedsLoading />
        ) : error ? (
          <FeedsError />
        ) : !feeds || feeds.length === 0 ? (
          <FeedsEmpty />
        ) : (
          <>
            {continentGroups.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>CONTINENT</Text>
                {continentGroups.map(group => (
                  <ZoneCard key={group.zone_id} group={group} />
                ))}
              </View>
            )}

            {countryGroups.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>COUNTRIES</Text>
                {countryGroups.map(group => (
                  <ZoneCard key={group.zone_id} group={group} />
                ))}
              </View>
            )}

            {cityGroups.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>CITIES</Text>
                {cityGroups.map(group => (
                  <ZoneCard key={group.zone_id} group={group} />
                ))}
              </View>
            )}
          </>
        )}
      </Layout.Content>
    </Layout.Screen>
  )
}

const styles = StyleSheet.create({
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#999999',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  zoneCard: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 8,
  },
  zoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  levelBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#F0F0F0',
    borderRadius: 0,
  },
  levelText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666666',
    letterSpacing: 0.5,
  },
  feedTypeEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingLeft: 8,
  },
  feedTypeInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#000000',
    borderRadius: 0,
    minWidth: 80,
    alignItems: 'center',
  },
  typeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  feedDescription: {
    fontSize: 12,
    color: '#666666',
    flex: 1,
  },
  pinButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 0,
    marginLeft: 8,
  },
  pinButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  centerMessage: {
    padding: 32,
    alignItems: 'center',
  },
  messageText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
})
