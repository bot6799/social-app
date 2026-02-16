import {useState} from 'react'
import {Pressable, View} from 'react-native'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'
import {useNavigation} from '@react-navigation/native'

import {type NavigationProp} from '#/lib/routes/types'
import {usePinnedFeedsInfos} from '#/state/queries/feed'
import {type FeedDescriptor} from '#/state/queries/post-feed'
import {useAddSavedFeedsMutation} from '#/state/queries/preferences'
import {useSession} from '#/state/session'
import {useSelectedFeed, useSetSelectedFeed} from '#/state/shell/selected-feed'
import {atoms as a, useTheme, web} from '#/alf'
import {useInteractionState} from '#/components/hooks/useInteractionState'
import {InlineLinkText} from '#/components/Link'
import {Text} from '#/components/Typography'

import {type ZoneHierarchy} from '#europe/services/zone-api'

export function SidebarZones({
  zoneTree,
  homeZoneId,
}: {
  zoneTree: ZoneHierarchy[]
  homeZoneId: string | null
}) {
  const t = useTheme()
  const {_} = useLingui()
  const [expanded, setExpanded] = useState(true)

  return (
    <View style={[a.gap_xs]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={_(msg`Toggle zones section`)}
        accessibilityHint={_(msg`Expands or collapses the zones list`)}
        onPress={() => setExpanded(v => !v)}
        style={[a.flex_row, a.align_center, a.gap_xs]}>
        <Text
          style={[
            a.text_2xs,
            a.font_bold,
            t.atoms.text_contrast_low,
            {letterSpacing: 1.5},
          ]}>
          {expanded ? '\u25BE' : '\u25B8'} <Trans>YOUR ZONES</Trans>
        </Text>
      </Pressable>

      {expanded && (
        <View style={[a.gap_2xs]}>
          {zoneTree.map(zone => (
            <ZoneTreeNode
              key={zone.id}
              zone={zone}
              homeZoneId={homeZoneId}
              depth={0}
            />
          ))}
          <InlineLinkText
            to="/europe/zones"
            label={_(msg`Browse all zones`)}
            style={[a.text_xs, t.atoms.text_contrast_medium, a.mt_xs]}>
            + <Trans>Browse all zones</Trans>
          </InlineLinkText>
        </View>
      )}
    </View>
  )
}

function ZoneTreeNode({
  zone,
  homeZoneId,
  depth,
}: {
  zone: ZoneHierarchy
  homeZoneId: string | null
  depth: number
}) {
  const t = useTheme()
  const {_} = useLingui()
  const [childrenExpanded, setChildrenExpanded] = useState(false)
  const hasChildren = zone.children && zone.children.length > 0
  const isHome = zone.id === homeZoneId

  const selectedFeed = useSelectedFeed()
  const setSelectedFeed = useSetSelectedFeed()
  const navigation = useNavigation<NavigationProp>()
  const {data: pinnedFeedInfos} = usePinnedFeedsInfos()
  const {mutateAsync: addSavedFeeds} = useAddSavedFeedsMutation()
  const {currentAccount} = useSession()
  const {
    state: hovered,
    onIn: onHoverIn,
    onOut: onHoverOut,
  } = useInteractionState()

  const feedUri = `at://did:web:eur.so/app.bsky.feed.generator/${zone.id}`
  const descriptor = `feedgen|${feedUri}` as FeedDescriptor
  const isActive = selectedFeed === descriptor

  const onZonePress = async () => {
    // Auto-pin the feed if not already pinned
    const isPinned = pinnedFeedInfos?.some(f => f.uri === feedUri)
    if (!isPinned && currentAccount) {
      try {
        await addSavedFeeds([{type: 'feed', value: feedUri, pinned: true}])
      } catch {
        // Feed may not exist yet in the network — still switch locally
      }
    }

    setSelectedFeed(descriptor)
    navigation.navigate('Home')
  }

  const onExpandPress = () => {
    setChildrenExpanded(v => !v)
  }

  return (
    <View>
      <View style={[a.flex_row, a.align_center, {paddingLeft: depth * 16}]}>
        {/* Expand/collapse toggle for zones with children */}
        {hasChildren ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={_(
              msg`${childrenExpanded ? 'Collapse' : 'Expand'} ${zone.name}`,
            )}
            accessibilityHint={_(msg`Shows or hides child zones`)}
            onPress={onExpandPress}
            style={[{width: 16, alignItems: 'center'}]}>
            <Text style={[a.text_xs, t.atoms.text_contrast_medium]}>
              {childrenExpanded ? '\u25BE' : '\u25B8'}
            </Text>
          </Pressable>
        ) : (
          <View style={[{width: 16}]} />
        )}

        {/* Zone name — click to switch feed */}
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={_(msg`Switch to ${zone.name} feed`)}
          accessibilityHint={_(msg`Switches the home feed to this zone`)}
          onPress={() => {
            void onZonePress()
          }}
          onHoverIn={onHoverIn}
          onHoverOut={onHoverOut}
          style={[
            a.flex_1,
            a.flex_row,
            a.align_center,
            a.gap_xs,
            {paddingVertical: 3, paddingHorizontal: 4},
            isActive && {backgroundColor: t.palette.primary_50},
          ]}>
          <Text
            style={[
              a.text_sm,
              a.flex_1,
              isActive
                ? [t.atoms.text, a.font_semi_bold]
                : hovered
                  ? t.atoms.text
                  : t.atoms.text_contrast_medium,
              web(
                hovered && !isActive ? {textDecorationLine: 'underline'} : {},
              ),
            ]}
            numberOfLines={1}>
            {zone.name}
          </Text>
          {isHome && (
            <Text
              style={[a.text_xs]}
              accessibilityLabel={_(msg`Home zone`)}
              accessibilityHint={_(msg`This is your home zone`)}>
              {'\u2605'}
            </Text>
          )}
        </Pressable>
      </View>

      {/* Children (expanded) */}
      {hasChildren && childrenExpanded && (
        <View>
          {zone.children.map(child => (
            <ZoneTreeNode
              key={child.id}
              zone={child}
              homeZoneId={homeZoneId}
              depth={depth + 1}
            />
          ))}
        </View>
      )}
    </View>
  )
}
