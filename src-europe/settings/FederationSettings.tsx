import {View} from 'react-native'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'
import {type NativeStackScreenProps} from '@react-navigation/native-stack'

import {type CommonNavigatorParams} from '#/lib/routes/types'
import * as SettingsList from '#/screens/Settings/components/SettingsList'
import {atoms as a, useTheme} from '#/alf'
import * as Layout from '#/components/Layout'
import {Text} from '#/components/Typography'
import {
  useFederationEnabled,
  useSetFederationEnabled,
} from '#europe/state/federation'
import {FederationMapToggle} from '#europe/onboarding/FederationMapToggle'

type Props = NativeStackScreenProps<
  CommonNavigatorParams,
  'FederationSettings'
>
export function FederationSettingsScreen({}: Props) {
  const {_} = useLingui()
  const t = useTheme()
  const fedEnabled = useFederationEnabled()
  const setFedEnabled = useSetFederationEnabled()

  return (
    <Layout.Screen>
      <Layout.Header.Outer>
        <Layout.Header.BackButton />
        <Layout.Header.Content>
          <Layout.Header.TitleText>
            <Trans>Federation</Trans>
          </Layout.Header.TitleText>
        </Layout.Header.Content>
        <Layout.Header.Slot />
      </Layout.Header.Outer>
      <Layout.Content>
        <SettingsList.Container>
          <View style={[a.px_lg, a.pt_lg]}>
            <FederationMapToggle
              enabled={fedEnabled}
              onToggle={() => setFedEnabled(!fedEnabled)}
            />
          </View>

          <View style={[a.px_lg, a.pt_lg, a.gap_md]}>
            {/* Current mode explanation */}
            <View
              style={[
                a.p_md,
                a.border,
                {borderColor: t.palette.contrast_900, borderWidth: 2},
              ]}>
              <Text style={[a.text_md, a.font_bold, {color: t.palette.contrast_900}]}>
                {fedEnabled ? (
                  <Trans>Open Network (active)</Trans>
                ) : (
                  <Trans>Europe Only (active)</Trans>
                )}
              </Text>
              <Text style={[a.text_sm, a.mt_xs, t.atoms.text_contrast_medium]}>
                {fedEnabled ? (
                  <Trans>
                    Your posts are visible across the AT Protocol network,
                    including Bluesky and other compatible services. Anyone can
                    discover and interact with your content.
                  </Trans>
                ) : (
                  <Trans>
                    Your posts stay on eur.so only. Users on Bluesky and other
                    services won't be able to see or interact with your content.
                    You can still see and interact with all content on eur.so.
                  </Trans>
                )}
              </Text>
            </View>

            {/* Info callout */}
            <View
              style={[
                a.p_md,
                t.atoms.bg_contrast_25,
                a.border,
                t.atoms.border_contrast_low,
              ]}>
              <Text style={[a.text_sm, t.atoms.text_contrast_medium]}>
                <Trans>
                  You can change this at any time. Switching to Open Network
                  will make your existing posts visible across the network.
                  Switching to Europe Only will remove your content from
                  external services.
                </Trans>
              </Text>
            </View>
          </View>
        </SettingsList.Container>
      </Layout.Content>
    </Layout.Screen>
  )
}
