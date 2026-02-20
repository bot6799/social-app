import {View} from 'react-native'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'

import {useSession} from '#/state/session'
import {atoms as a, useTheme} from '#/alf'
import {InlineLinkText} from '#/components/Link'
import {Text} from '#/components/Typography'

import {useSidebarQuery} from '#europe/services/queries'
import {SidebarQuickLinks} from '#europe/widgets/SidebarQuickLinks'
import {SidebarZones} from '#europe/widgets/SidebarZones'

function SidebarEuropeInner() {
  const t = useTheme()
  const {_} = useLingui()
  const {currentAccount} = useSession()
  const {data: sidebar, error, isLoading} = useSidebarQuery(currentAccount?.did)

  return (
    <View
      style={[
        a.gap_md,
        a.p_md,
        t.atoms.bg_contrast_25,
        {borderWidth: 1, borderColor: t.atoms.border_contrast_low.borderColor},
      ]}>
      {/* Header */}
      <View style={[a.flex_row, a.align_center, a.justify_between]}>
        <Text style={[a.text_xs, a.font_bold, {letterSpacing: 1.5}]}>
          <Trans>EUROPE SOCIAL</Trans>
        </Text>
        <InlineLinkText
          to="/settings/federation"
          label={_(msg`Settings`)}
          style={[a.text_xs, t.atoms.text_contrast_medium]}>
          {'\u2699'}
        </InlineLinkText>
      </View>

      {/* Zone tree with feed switching */}
      {isLoading ? (
        <View style={[a.gap_xs]}>
          <View style={[t.atoms.bg_contrast_50, {height: 12, width: '50%'}]} />
          <View style={[t.atoms.bg_contrast_50, {height: 12, width: '70%'}]} />
          <View style={[t.atoms.bg_contrast_50, {height: 12, width: '40%'}]} />
        </View>
      ) : error ? (
        <Text style={[a.text_xs, t.atoms.text_contrast_low]}>
          <Trans>Zone service unavailable</Trans>
        </Text>
      ) : sidebar?.zone_tree && sidebar.zone_tree.length > 0 ? (
        <SidebarZones
          zoneTree={sidebar.zone_tree}
          homeZoneId={sidebar.home_zone?.id ?? null}
        />
      ) : null}

      {/* Divider */}
      <View
        style={[
          {
            borderTopWidth: 1,
            borderColor: t.atoms.border_contrast_low.borderColor,
          },
        ]}
      />

      {/* Quick Links */}
      <SidebarQuickLinks />
    </View>
  )
}

export function SidebarEurope() {
  return (
    <View>
      <SidebarEuropeInner />
    </View>
  )
}
