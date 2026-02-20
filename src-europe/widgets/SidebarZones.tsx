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

const MAX_BROWSE_COUNTRIES = 8

export function SidebarZones({
  zoneTree,
  homeZoneId,
}: {
  zoneTree: ZoneHierarchy[]
  homeZoneId: string | null
}) {
  const t = useTheme()
  const {_} = useLingui()

  // Flatten: find all countries and the home zone
  const europeZone = zoneTree.find(z => z.id === 'europe')
  const countries = europeZone?.children ?? []
  const homeCountry = countries.find(c => c.id === homeZoneId)
  const otherCountries = countries.filter(c => c.id !== homeZoneId)

  return (
    <View style={[a.gap_md]}>
      {/* Home Zone section */}
      {homeCountry ? (
        <View style={[a.gap_xs]}>
          <View style={[a.flex_row, a.align_center, a.gap_xs]}>
            <Text style={[a.text_sm]}>{'\u2605'}</Text>
            <ZoneLink zone={homeCountry} bold />
          </View>
          {homeCountry.children && homeCountry.children.length > 0 && (
            <View style={[a.flex_row, a.flex_wrap, a.gap_2xs, a.pl_lg]}>
              {homeCountry.children.map((city, i) => (
                <View key={city.id} style={[a.flex_row, a.align_center]}>
                  {i > 0 && (
                    <Text
                      style={[a.text_xs, t.atoms.text_contrast_low, a.mr_2xs]}>
                      {'\u00B7'}
                    </Text>
                  )}
                  <ZoneLink zone={city} />
                </View>
              ))}
            </View>
          )}
        </View>
      ) : (
        <InlineLinkText
          to="/europe/zones"
          label={_(msg`Set your home zone`)}
          style={[a.text_xs, t.atoms.text_contrast_medium]}>
          <Trans>Set your home zone</Trans> {'\u2192'}
        </InlineLinkText>
      )}

      {/* Divider */}
      {otherCountries.length > 0 && (
        <View
          style={[
            {
              borderTopWidth: 1,
              borderColor: t.atoms.border_contrast_low.borderColor,
            },
          ]}
        />
      )}

      {/* Browse Zones section */}
      {otherCountries.length > 0 && (
        <View style={[a.gap_xs]}>
          <Text
            style={[
              a.text_2xs,
              a.font_bold,
              t.atoms.text_contrast_low,
              {letterSpacing: 1.5},
            ]}>
            <Trans>BROWSE ZONES</Trans>
          </Text>
          <View style={[a.flex_row, a.flex_wrap, a.gap_2xs]}>
            {otherCountries.slice(0, MAX_BROWSE_COUNTRIES).map((country, i) => (
              <View key={country.id} style={[a.flex_row, a.align_center]}>
                {i > 0 && (
                  <Text
                    style={[a.text_xs, t.atoms.text_contrast_low, a.mr_2xs]}>
                    {'\u00B7'}
                  </Text>
                )}
                <ZoneLink zone={country} />
              </View>
            ))}
          </View>
          {otherCountries.length > MAX_BROWSE_COUNTRIES && (
            <InlineLinkText
              to="/europe/zones"
              label={_(msg`Browse all zones`)}
              style={[a.text_xs, t.atoms.text_contrast_medium]}>
              + {otherCountries.length - MAX_BROWSE_COUNTRIES}{' '}
              <Trans>more</Trans>
            </InlineLinkText>
          )}
        </View>
      )}
    </View>
  )
}

function ZoneLink({zone, bold}: {zone: ZoneHierarchy; bold?: boolean}) {
  const t = useTheme()
  const {_} = useLingui()
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

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={_(msg`Switch to ${zone.name} feed`)}
      accessibilityHint={_(msg`Switches the home feed to this zone`)}
      onPress={() => {
        void onZonePress()
      }}
      onHoverIn={onHoverIn}
      onHoverOut={onHoverOut}>
      <Text
        style={[
          a.text_xs,
          isActive
            ? [t.atoms.text, a.font_bold]
            : bold
              ? [t.atoms.text, a.font_semi_bold]
              : hovered
                ? t.atoms.text
                : t.atoms.text_contrast_medium,
          web(hovered && !isActive ? {textDecorationLine: 'underline'} : {}),
        ]}
        numberOfLines={1}>
        {zone.name}
      </Text>
    </Pressable>
  )
}
