import {View} from 'react-native'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'

import {
  OnboardingControls,
  OnboardingPosition,
  OnboardingTitleText,
} from '#/screens/Onboarding/Layout'
import {useOnboardingInternalState} from '#/screens/Onboarding/state'
import {atoms as a, useBreakpoints, useTheme} from '#/alf'
import {Button, ButtonText} from '#/components/Button'
import {Text} from '#/components/Typography'

import {FederationMapToggle} from '#europe/onboarding/FederationMapToggle'

export function StepFederation() {
  const {_} = useLingui()
  const t = useTheme()
  const {gtMobile} = useBreakpoints()
  const {state, dispatch} = useOnboardingInternalState()

  const enabled = state.federationStepResults.enabled

  const toggle = () => {
    dispatch({
      type: 'setFederationStepResults',
      enabled: !enabled,
    })
  }

  const continueStep = () => {
    dispatch({type: 'next'})
  }

  return (
    <View style={[a.align_start, a.gap_sm]} testID="onboardingFederation">
      <OnboardingPosition />
      <OnboardingTitleText>
        <Trans>How do you want to connect?</Trans>
      </OnboardingTitleText>

      <View style={[a.gap_md, a.w_full, a.pt_xs]}>
        <Text style={[a.text_md, a.leading_snug, t.atoms.text_contrast_medium]}>
          <Trans>
            Europe Social is part of the AT Protocol network. Choose whether
            your content is visible across the open network or stays within
            Europe Social only.
          </Trans>
        </Text>

        <FederationMapToggle enabled={enabled} onToggle={toggle} />

        {/* Option descriptions */}
        <View style={[a.gap_md]}>
          <View
            style={[
              a.p_md,
              a.border,
              enabled
                ? {borderColor: t.palette.contrast_900, borderWidth: 2}
                : t.atoms.border_contrast_low,
            ]}>
            <Text
              style={[
                a.text_md,
                a.font_bold,
                enabled
                  ? {color: t.palette.contrast_900}
                  : t.atoms.text_contrast_medium,
              ]}>
              <Trans>Open (recommended)</Trans>
            </Text>
            <Text
              style={[
                a.text_sm,
                a.mt_xs,
                t.atoms.text_contrast_medium,
              ]}>
              <Trans>
                Your profile and posts are visible across the AT Protocol
                network, including Bluesky.
              </Trans>
            </Text>
          </View>

          <View
            style={[
              a.p_md,
              a.border,
              !enabled
                ? {borderColor: t.palette.contrast_900, borderWidth: 2}
                : t.atoms.border_contrast_low,
            ]}>
            <Text
              style={[
                a.text_md,
                a.font_bold,
                !enabled
                  ? {color: t.palette.contrast_900}
                  : t.atoms.text_contrast_medium,
              ]}>
              <Trans>Europe Only</Trans>
            </Text>
            <Text
              style={[
                a.text_sm,
                a.mt_xs,
                t.atoms.text_contrast_medium,
              ]}>
              <Trans>
                Your profile and posts stay on eur.so. Not visible on Bluesky
                or other services.
              </Trans>
            </Text>
          </View>
        </View>

        <Text style={[a.text_xs, t.atoms.text_contrast_low, a.text_center]}>
          <Trans>You can change this anytime in Settings</Trans>
        </Text>
      </View>

      <OnboardingControls.Portal>
        <View style={[a.gap_md, gtMobile && a.flex_row_reverse]}>
          <Button
            testID="onboardingFederationContinue"
            color="primary"
            size="large"
            label={_(msg`Continue`)}
            onPress={continueStep}>
            <ButtonText>
              <Trans>Continue</Trans>
            </ButtonText>
          </Button>
        </View>
      </OnboardingControls.Portal>
    </View>
  )
}
