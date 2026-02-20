import {View} from 'react-native'
import {msg} from '@lingui/macro'
import {useLingui} from '@lingui/react'

import {atoms as a, useTheme} from '#/alf'
import {InlineLinkText} from '#/components/Link'
import {Text} from '#/components/Typography'

export function SidebarQuickLinks() {
  const t = useTheme()
  const {_} = useLingui()

  return (
    <View style={[a.flex_row, a.align_center, a.gap_sm, a.flex_wrap]}>
      <InlineLinkText
        to="/settings/federation"
        label={_(msg`Settings`)}
        style={[a.text_xs, t.atoms.text_contrast_medium]}>
        {_(msg`Settings`)}
      </InlineLinkText>
      <Text style={[a.text_xs, t.atoms.text_contrast_low]}>{'\u00B7'}</Text>
      <InlineLinkText
        to="/support"
        label={_(msg`Help`)}
        style={[a.text_xs, t.atoms.text_contrast_medium]}>
        {_(msg`Help`)}
      </InlineLinkText>
    </View>
  )
}
