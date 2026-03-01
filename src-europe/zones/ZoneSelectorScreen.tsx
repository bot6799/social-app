import {useState} from 'react'
import {Pressable, View} from 'react-native'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'

import {
  useAddSavedFeedsMutation,
  usePreferencesQuery,
  useRemoveFeedMutation,
} from '#/state/queries/preferences'
import {useSession} from '#/state/session'
import {atoms as a, useTheme, web} from '#/alf'
import {Button, ButtonText} from '#/components/Button'
import * as Dialog from '#/components/Dialog'
import {useInteractionState} from '#/components/hooks/useInteractionState'
import * as Layout from '#/components/Layout'
import {Loader} from '#/components/Loader'
import * as Toast from '#/components/Toast'
import {Text} from '#/components/Typography'

import {
  useSidebarQuery,
  useUserHomeZoneQuery,
} from '#europe/services/queries'
import {type ZoneHierarchy} from '#europe/services/zone-api'
import {ZoneVerifyDialog} from '#europe/zones/ZoneVerifyDialog'

export function ZoneSelectorScreen() {
  const t = useTheme()
  const {_} = useLingui()
  const {currentAccount} = useSession()
  const verifyControl = Dialog.useDialogControl()

  const {
    data: sidebar,
    isLoading,
    error,
    refetch,
  } = useSidebarQuery(currentAccount?.did)

  const homeZone = sidebar?.home_zone ?? null
  const zoneTree = sidebar?.zone_tree ?? []

  // Find the home zone's verified status from user_home_zone data
  // The sidebar returns the zone object; we need verified info from userHome query
  // For now, check zone_feeds for the home zone indicator

  return (
    <Layout.Screen>
      <Layout.Header.Outer>
        <Layout.Header.BackButton />
        <Layout.Header.Content>
          <Layout.Header.TitleText>
            <Trans>Zones</Trans>
          </Layout.Header.TitleText>
        </Layout.Header.Content>
        <Layout.Header.Slot />
      </Layout.Header.Outer>

      <Layout.Content>
        {isLoading ? (
          <View style={[a.flex_1, a.justify_center, a.align_center, a.py_5xl]}>
            <Loader size="lg" />
            <Text style={[a.text_sm, t.atoms.text_contrast_medium, a.mt_md]}>
              <Trans>Loading zones...</Trans>
            </Text>
          </View>
        ) : error ? (
          <View style={[a.p_xl, a.gap_md]}>
            <Text style={[a.text_md, a.font_bold, t.atoms.text]}>
              <Trans>Failed to load zones</Trans>
            </Text>
            <Text style={[a.text_sm, t.atoms.text_contrast_medium]}>
              <Trans>
                Is the Zone Service running on :8001?
              </Trans>
            </Text>
            <Text style={[a.text_xs, t.atoms.text_contrast_low]}>
              {String(error)}
            </Text>
            <Button
              label={_(msg`Retry`)}
              onPress={() => void refetch()}
              color="primary"
              size="small">
              <ButtonText>
                <Trans>Retry</Trans>
              </ButtonText>
            </Button>
          </View>
        ) : (
          <View style={[a.py_lg]}>
            {/* Section 1: Home Zone Hero */}
            <HomeZoneCard
              homeZone={homeZone}
              onVerify={() => verifyControl.open()}
            />

            {/* Section 2: Browse Zones Tree */}
            <View style={[a.mt_xl, a.px_lg]}>
              <Text
                style={[
                  a.text_2xs,
                  a.font_bold,
                  t.atoms.text_contrast_low,
                  {letterSpacing: 1.5},
                  a.mb_md,
                ]}>
                <Trans>BROWSE ZONES</Trans>
              </Text>
              <View style={[a.border, t.atoms.border_contrast_low]}>
                {zoneTree.map((zone, i) => (
                  <ZoneBrowseNode
                    key={zone.id}
                    zone={zone}
                    homeZoneId={homeZone?.id ?? null}
                    depth={0}
                    isLast={i === zoneTree.length - 1}
                  />
                ))}
              </View>
            </View>
          </View>
        )}
      </Layout.Content>

      <ZoneVerifyDialog control={verifyControl} />
    </Layout.Screen>
  )
}

function HomeZoneCard({
  homeZone,
  onVerify,
}: {
  homeZone: {id: string; name: string; level: string} | null
  onVerify: () => void
}) {
  const t = useTheme()
  const {_} = useLingui()
  const {currentAccount} = useSession()
  const {data: userHome} = useUserHomeZoneQuery(currentAccount?.did ?? '')

  const verified = userHome?.verified ?? false
  const verifiedAt = userHome?.verified_at ?? null

  return (
    <View style={[a.px_lg]}>
      <Text
        style={[
          a.text_2xs,
          a.font_bold,
          t.atoms.text_contrast_low,
          {letterSpacing: 1.5},
          a.mb_md,
        ]}>
        <Trans>YOUR HOME ZONE</Trans>
      </Text>
      <View
        style={[
          a.p_lg,
          a.border,
          t.atoms.border_contrast_low,
          t.atoms.bg_contrast_25,
        ]}>
        {homeZone ? (
          <>
            <View style={[a.flex_row, a.align_center, a.justify_between]}>
              <Text style={[a.text_lg, a.font_bold, t.atoms.text]}>
                {homeZone.name}
              </Text>
              <Text style={[a.text_md]}>{'\u2605'}</Text>
            </View>
            <Text
              style={[a.text_xs, t.atoms.text_contrast_medium, a.mt_xs]}>
              {verified ? (
                <>
                  {'\u2713'} <Trans>Verified via GPS</Trans>
                  {verifiedAt && (
                    <>
                      {' \u00B7 '}
                      <Trans>
                        Set{' '}
                        {new Date(verifiedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Trans>
                    </>
                  )}
                </>
              ) : (
                <Trans>Not verified — verify with GPS to post as a local</Trans>
              )}
            </Text>
            <View style={[a.flex_row, a.gap_sm, a.mt_md]}>
              <Button
                label={_(msg`Change`)}
                onPress={onVerify}
                color="secondary"
                size="small"
                variant="outline">
                <ButtonText>
                  <Trans>Change</Trans>
                </ButtonText>
              </Button>
              {!verified && (
                <Button
                  label={_(msg`Verify with GPS`)}
                  onPress={onVerify}
                  color="primary"
                  size="small">
                  <ButtonText>
                    <Trans>Verify with GPS</Trans>
                  </ButtonText>
                </Button>
              )}
              {verified && (
                <Button
                  label={_(msg`Verify again`)}
                  onPress={onVerify}
                  color="secondary"
                  size="small"
                  variant="outline">
                  <ButtonText>
                    <Trans>Verify Again</Trans>
                  </ButtonText>
                </Button>
              )}
            </View>
          </>
        ) : (
          <>
            <Text style={[a.text_sm, t.atoms.text_contrast_medium]}>
              <Trans>
                Set your home zone to see local content and post as a local.
              </Trans>
            </Text>
            <View style={[a.flex_row, a.gap_sm, a.mt_md]}>
              <Button
                label={_(msg`Verify with GPS`)}
                onPress={onVerify}
                color="primary"
                size="small">
                <ButtonText>
                  <Trans>Verify with GPS</Trans>
                </ButtonText>
              </Button>
              <Button
                label={_(msg`Set manually`)}
                onPress={onVerify}
                color="secondary"
                size="small"
                variant="outline">
                <ButtonText>
                  <Trans>Set Manually</Trans>
                </ButtonText>
              </Button>
            </View>
          </>
        )}
      </View>
    </View>
  )
}

function ZoneBrowseNode({
  zone,
  homeZoneId,
  depth,
  isLast,
}: {
  zone: ZoneHierarchy
  homeZoneId: string | null
  depth: number
  isLast: boolean
}) {
  const t = useTheme()
  const {_} = useLingui()
  const [expanded, setExpanded] = useState(depth < 1) // Auto-expand top level
  const hasChildren = zone.children && zone.children.length > 0
  const isHome = zone.id === homeZoneId

  const {
    state: hovered,
    onIn: onHoverIn,
    onOut: onHoverOut,
  } = useInteractionState()

  const feedUri = `at://did:web:eur.so/app.bsky.feed.generator/${zone.id}`

  // Check if this zone feed is already saved/pinned
  const {data: preferences} = usePreferencesQuery()
  const savedFeed = preferences?.savedFeeds?.find(
    f => f.value === feedUri && f.pinned,
  )
  const isFollowing = !!savedFeed

  const {mutateAsync: addSavedFeeds} = useAddSavedFeedsMutation()
  const {mutateAsync: removeFeed} = useRemoveFeedMutation()

  const [localFollowing, setLocalFollowing] = useState(false)
  const isFollowingDisplay = isFollowing || localFollowing

  const toggleFollow = async () => {
    if (isFollowing && savedFeed) {
      try {
        await removeFeed({id: savedFeed.id})
        setLocalFollowing(false)
        Toast.show(_(msg`Unfollowed ${zone.name}`))
      } catch {
        Toast.show(_(msg`Failed to unfollow`), {type: 'error'})
      }
    } else {
      // Optimistically mark as following — feed generator may not exist
      // on the network yet, so addSavedFeeds can fail
      setLocalFollowing(true)
      Toast.show(_(msg`Following ${zone.name}`))
      try {
        await addSavedFeeds([{type: 'feed', value: feedUri, pinned: true}])
      } catch {
        // Feed generator not yet deployed — local state is enough for now
      }
    }
  }

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={_(msg`${zone.name} zone`)}
        onHoverIn={onHoverIn}
        onHoverOut={onHoverOut}
        onPress={() => hasChildren && setExpanded(v => !v)}
        style={[
          a.flex_row,
          a.align_center,
          a.py_sm,
          a.px_md,
          {paddingLeft: 16 + depth * 20},
          !isLast && [a.border_b, t.atoms.border_contrast_low],
          isHome && t.atoms.bg_contrast_25,
          hovered && t.atoms.bg_contrast_25,
        ]}>
        {/* Expand/collapse indicator */}
        <View style={[{width: 20}]}>
          {hasChildren && (
            <Text style={[a.text_xs, t.atoms.text_contrast_medium]}>
              {expanded ? '\u25BE' : '\u25B8'}
            </Text>
          )}
        </View>

        {/* Zone name */}
        <View style={[a.flex_1, a.flex_row, a.align_center, a.gap_xs]}>
          <Text
            style={[
              a.text_sm,
              t.atoms.text,
              isHome && a.font_bold,
              web(hovered ? {textDecorationLine: 'underline'} : {}),
            ]}
            numberOfLines={1}>
            {zone.name}
          </Text>
          {isHome && (
            <Text style={[a.text_xs, t.atoms.text]}>
              {'\u2605'}
            </Text>
          )}
        </View>

        {/* Follow/Following button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={_(
            isFollowingDisplay
              ? msg`Unfollow ${zone.name}`
              : msg`Follow ${zone.name}`,
          )}
          onPress={e => {
            e.stopPropagation()
            void toggleFollow()
          }}
          style={[
            a.px_sm,
            a.py_xs,
            a.border,
            isFollowingDisplay
              ? [t.atoms.border_contrast_medium]
              : [{borderColor: '#000', backgroundColor: '#000'}],
          ]}>
          <Text
            style={[
              a.text_xs,
              a.font_bold,
              isFollowingDisplay ? t.atoms.text : {color: '#fff'},
            ]}>
            {isFollowingDisplay ? (
              <Trans>Following</Trans>
            ) : (
              <Trans>Follow</Trans>
            )}
          </Text>
        </Pressable>
      </Pressable>

      {/* Children */}
      {hasChildren && expanded && (
        <View>
          {zone.children.map((child, i) => (
            <ZoneBrowseNode
              key={child.id}
              zone={child}
              homeZoneId={homeZoneId}
              depth={depth + 1}
              isLast={i === zone.children.length - 1}
            />
          ))}
        </View>
      )}
    </View>
  )
}
