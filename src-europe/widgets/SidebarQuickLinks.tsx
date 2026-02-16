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
      <Text style={[a.text_xs, t.atoms.text_contrast_low]}>{'\u26A1'}</Text>
      <InlineLinkText
        to="/europe"
        label={_(msg`Dashboard`)}
        style={[a.text_xs, t.atoms.text_contrast_medium]}>
        {_(msg`Dashboard`)}
      </InlineLinkText>
      <Text style={[a.text_xs, t.atoms.text_contrast_low]}>{'\u00B7'}</Text>
      <InlineLinkText
        to="/europe/translation"
        label={_(msg`Translate`)}
        style={[a.text_xs, t.atoms.text_contrast_medium]}>
        {_(msg`Translate`)}
      </InlineLinkText>
      <Text style={[a.text_xs, t.atoms.text_contrast_low]}>{'\u00B7'}</Text>
      <InlineLinkText
        to="/europe/zones"
        label={_(msg`Zones`)}
        style={[a.text_xs, t.atoms.text_contrast_medium]}>
        {_(msg`Zones`)}
      </InlineLinkText>
    </View>
  )
}
