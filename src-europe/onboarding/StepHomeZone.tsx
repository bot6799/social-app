import {useState} from 'react'
import {View} from 'react-native'
import * as Location from 'expo-location'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'

import {logger} from '#/logger'
import {
  OnboardingControls,
  OnboardingDescriptionText,
  OnboardingHeaderSlot,
  OnboardingPosition,
  OnboardingTitleText,
} from '#/screens/Onboarding/Layout'
import {useOnboardingInternalState} from '#/screens/Onboarding/state'
import {atoms as a, useBreakpoints, useTheme} from '#/alf'
import {Button, ButtonIcon, ButtonText} from '#/components/Button'
import * as TextField from '#/components/forms/TextField'
import {Loader} from '#/components/Loader'
import {Text} from '#/components/Typography'

import {useZoneSearchQuery} from '#europe/services/queries'
import {type Zone, type ZoneResolution, zoneAPI} from '#europe/services/zone-api'

type SubStep =
  | 'welcome'
  | 'choose'
  | 'detecting'
  | 'confirming'
  | 'manual'
  | 'error'

export function StepHomeZone() {
  const {_} = useLingui()
  const t = useTheme()
  const {gtMobile} = useBreakpoints()
  const {state, dispatch} = useOnboardingInternalState()

  const [subStep, setSubStep] = useState<SubStep>('welcome')
  const [resolution, setResolution] = useState<ZoneResolution | null>(null)
  const [manualZone, setManualZone] = useState<Zone | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const {data: searchResults} = useZoneSearchQuery(searchQuery)

  const skipZoneStep = () => {
    dispatch({
      type: 'setHomeZoneStepResults',
      zone: null,
      chain: [],
      verified: false,
    })
    dispatch({type: 'next'})
  }

  const confirmAndContinue = (
    zone: {id: string; name: string; level: string},
    chain: {id: string; name: string; level: string}[],
    verified: boolean,
  ) => {
    dispatch({
      type: 'setHomeZoneStepResults',
      zone,
      chain,
      verified,
    })
    dispatch({type: 'next'})
  }

  const startGPSDetection = async () => {
    setSubStep('detecting')
    try {
      const perm = await Location.requestForegroundPermissionsAsync()
      if (!perm.granted) {
        setErrorMessage(
          _(
            msg`Location permission denied. You can set your zone manually instead.`,
          ),
        )
        setSubStep('error')
        return
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })
      const {latitude, longitude} = position.coords

      const result = await zoneAPI.resolveLocation(latitude, longitude)
      setResolution(result)
      setSubStep('confirming')
    } catch (e) {
      logger.error('Onboarding: GPS zone detection failed', {safeMessage: e})
      setErrorMessage(
        e instanceof Error
          ? e.message
          : _(msg`Could not detect your location. Try searching manually.`),
      )
      setSubStep('error')
    }
  }

  const selectManualZone = (zone: Zone) => {
    setManualZone(zone)
  }

  // -- Sub-step: Welcome to Europe Social --
  if (subStep === 'welcome') {
    return (
      <View style={[a.align_start, a.gap_sm]} testID="onboardingHomeZone">
        <OnboardingPosition />
        <OnboardingTitleText>
          <Trans>Welcome to Europe's Square</Trans>
        </OnboardingTitleText>

        <View style={[a.gap_md, a.pt_xs]}>
          <Text style={[a.text_md, a.leading_snug, t.atoms.text_contrast_medium]}>
            <Trans>
              Europe Social is built different. Your data stays in the EU. Your
              feed is shaped by where you are, not what an algorithm thinks you
              want. No ads. No surveillance. Just your community.
            </Trans>
          </Text>

          <View style={[a.gap_sm, a.pt_xs]}>
            <FeatureLine emoji="📍" text={_(msg`Zone-based feeds from your city to all of Europe`)} />
            <FeatureLine emoji="🔒" text={_(msg`EU data residency — your data never leaves Europe`)} />
            <FeatureLine emoji="🌍" text={_(msg`Automatic translation across 28 European languages`)} />
            <FeatureLine emoji="✓" text={_(msg`Verified journalists and on-the-ground reporting`)} />
          </View>

          <Text style={[a.text_md, a.leading_snug, t.atoms.text_contrast_medium, a.pt_xs]}>
            <Trans>
              Let's start by finding your home zone — the place that anchors
              your feed.
            </Trans>
          </Text>
        </View>

        <OnboardingControls.Portal>
          <View style={[a.gap_md, gtMobile && a.flex_row_reverse]}>
            <Button
              testID="onboardingHomeZoneContinue"
              color="primary"
              size="large"
              label={_(msg`Set my home zone`)}
              onPress={() => setSubStep('choose')}>
              <ButtonText>
                <Trans>Set My Home Zone</Trans>
              </ButtonText>
            </Button>
            <Button
              color="secondary"
              size="large"
              label={_(msg`Skip for now`)}
              onPress={skipZoneStep}>
              <ButtonText>
                <Trans>Skip for Now</Trans>
              </ButtonText>
            </Button>
          </View>
        </OnboardingControls.Portal>
      </View>
    )
  }

  // -- Sub-step: Choose method --
  if (subStep === 'choose') {
    return (
      <View style={[a.align_start, a.gap_sm]} testID="onboardingHomeZone">
        <OnboardingPosition />
        <OnboardingTitleText>
          <Trans>Where in Europe is home?</Trans>
        </OnboardingTitleText>
        <OnboardingDescriptionText>
          <Trans>
            Your home zone shapes your feed with local news, conversations,
            and on-the-ground reporting from your community.
          </Trans>
        </OnboardingDescriptionText>

        <View style={[a.w_full, a.pt_lg, a.gap_md]}>
          <Button
            label={_(msg`Detect with GPS`)}
            onPress={startGPSDetection}
            color="primary"
            size="large">
            <ButtonText>
              <Trans>Detect with GPS</Trans>
            </ButtonText>
          </Button>
          <Button
            label={_(msg`Search manually`)}
            onPress={() => setSubStep('manual')}
            color="secondary"
            size="large"
            variant="outline">
            <ButtonText>
              <Trans>Search Manually</Trans>
            </ButtonText>
          </Button>
        </View>

        <OnboardingHeaderSlot.Portal>
          <Button
            variant="ghost"
            color="secondary"
            size="small"
            label={_(msg`Skip zone selection`)}
            onPress={skipZoneStep}
            style={[a.bg_transparent]}>
            <ButtonText>
              <Trans>Skip</Trans>
            </ButtonText>
          </Button>
        </OnboardingHeaderSlot.Portal>

        <OnboardingControls.Portal>
          <Button
            color="secondary"
            size="large"
            label={_(msg`Go back`)}
            onPress={() => setSubStep('welcome')}>
            <ButtonText>
              <Trans>Back</Trans>
            </ButtonText>
          </Button>
        </OnboardingControls.Portal>
      </View>
    )
  }

  // -- Sub-step: Detecting GPS --
  if (subStep === 'detecting') {
    return (
      <View style={[a.align_start, a.gap_sm]} testID="onboardingHomeZone">
        <OnboardingPosition />
        <OnboardingTitleText>
          <Trans>Finding your zone...</Trans>
        </OnboardingTitleText>

        <View style={[a.w_full, a.align_center, a.py_2xl]}>
          <Loader size="lg" />
          <Text style={[a.text_sm, t.atoms.text_contrast_medium, a.pt_md]}>
            <Trans>
              Detecting your location. Your exact coordinates are never stored.
            </Trans>
          </Text>
        </View>

        <OnboardingControls.Portal>{null}</OnboardingControls.Portal>
      </View>
    )
  }

  // -- Sub-step: Confirm GPS result --
  if (subStep === 'confirming' && resolution) {
    const chainText = resolution.chain.map(z => z.name).join(' \u203A ')

    return (
      <View style={[a.align_start, a.gap_sm]} testID="onboardingHomeZone">
        <OnboardingPosition />
        <OnboardingTitleText>
          <Trans>Is this home?</Trans>
        </OnboardingTitleText>

        <View style={[a.w_full, a.pt_md, a.gap_lg]}>
          <View
            style={[
              a.p_lg,
              a.border,
              t.atoms.border_contrast_low,
              t.atoms.bg_contrast_25,
            ]}>
            <Text style={[a.text_xl, a.font_bold, t.atoms.text]}>
              {resolution.zone.name}
            </Text>
            <Text
              style={[a.text_sm, t.atoms.text_contrast_medium, a.mt_xs]}>
              {chainText}
            </Text>
          </View>
          <Text style={[a.text_sm, t.atoms.text_contrast_medium]}>
            <Trans>
              Detected via GPS. Your zone feeds will be pinned automatically.
            </Trans>
          </Text>
        </View>

        <OnboardingControls.Portal>
          <View style={[a.gap_md, gtMobile && a.flex_row_reverse]}>
            <Button
              color="primary"
              size="large"
              label={_(msg`Confirm home zone`)}
              onPress={() =>
                confirmAndContinue(
                  {
                    id: resolution.zone.id,
                    name: resolution.zone.name,
                    level: resolution.zone.level,
                  },
                  resolution.chain.map(z => ({
                    id: z.id,
                    name: z.name,
                    level: z.level,
                  })),
                  true,
                )
              }>
              <ButtonText>
                <Trans>Yes, This is Home</Trans>
              </ButtonText>
            </Button>
            <Button
              color="secondary"
              size="large"
              label={_(msg`Search instead`)}
              onPress={() => {
                setResolution(null)
                setSubStep('manual')
              }}>
              <ButtonText>
                <Trans>No, Search Instead</Trans>
              </ButtonText>
            </Button>
          </View>
        </OnboardingControls.Portal>
      </View>
    )
  }

  // -- Sub-step: Manual search --
  if (subStep === 'manual') {
    return (
      <View style={[a.align_start, a.gap_sm]} testID="onboardingHomeZone">
        <OnboardingPosition />
        <OnboardingTitleText>
          <Trans>Find your zone</Trans>
        </OnboardingTitleText>
        <OnboardingDescriptionText>
          <Trans>Search for your city, region, or country.</Trans>
        </OnboardingDescriptionText>

        <View style={[a.w_full, a.pt_md, a.gap_md]}>
          <TextField.Root>
            <TextField.Input
              label={_(msg`Search zones`)}
              placeholder={_(msg`Type a city or country...`)}
              defaultValue={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </TextField.Root>

          {searchResults && searchResults.length > 0 ? (
            <View style={[a.gap_2xs]}>
              {searchResults.map(zone => (
                <Button
                  key={zone.id}
                  label={zone.name}
                  onPress={() => selectManualZone(zone)}
                  color={
                    manualZone?.id === zone.id ? 'primary' : 'secondary'
                  }
                  size="small"
                  variant={
                    manualZone?.id === zone.id ? 'solid' : 'outline'
                  }>
                  <ButtonText>
                    {zone.name}
                    {zone.level !== 'global' && zone.level !== 'europe'
                      ? ` (${zone.level})`
                      : ''}
                  </ButtonText>
                </Button>
              ))}
            </View>
          ) : searchQuery.length >= 2 ? (
            <Text
              style={[a.text_sm, t.atoms.text_contrast_medium, a.py_sm]}>
              <Trans>No zones found for "{searchQuery}"</Trans>
            </Text>
          ) : (
            <Text
              style={[a.text_sm, t.atoms.text_contrast_medium, a.py_sm]}>
              <Trans>Type at least 2 characters to search</Trans>
            </Text>
          )}
        </View>

        <OnboardingHeaderSlot.Portal>
          <Button
            variant="ghost"
            color="secondary"
            size="small"
            label={_(msg`Skip zone selection`)}
            onPress={skipZoneStep}
            style={[a.bg_transparent]}>
            <ButtonText>
              <Trans>Skip</Trans>
            </ButtonText>
          </Button>
        </OnboardingHeaderSlot.Portal>

        <OnboardingControls.Portal>
          <View style={[a.gap_md, gtMobile && a.flex_row_reverse]}>
            {manualZone && (
              <Button
                color="primary"
                size="large"
                label={_(msg`Set as home zone`)}
                onPress={() =>
                  confirmAndContinue(
                    {
                      id: manualZone.id,
                      name: manualZone.name,
                      level: manualZone.level,
                    },
                    [
                      {
                        id: manualZone.id,
                        name: manualZone.name,
                        level: manualZone.level,
                      },
                    ],
                    false,
                  )
                }>
                <ButtonText>
                  <Trans>Set {manualZone.name} as Home</Trans>
                </ButtonText>
              </Button>
            )}
            <Button
              color="secondary"
              size="large"
              label={_(msg`Go back`)}
              onPress={() => {
                setManualZone(null)
                setSearchQuery('')
                setSubStep('choose')
              }}>
              <ButtonText>
                <Trans>Back</Trans>
              </ButtonText>
            </Button>
          </View>
        </OnboardingControls.Portal>
      </View>
    )
  }

  // -- Sub-step: Error --
  if (subStep === 'error') {
    return (
      <View style={[a.align_start, a.gap_sm]} testID="onboardingHomeZone">
        <OnboardingPosition />
        <OnboardingTitleText>
          <Trans>Something went wrong</Trans>
        </OnboardingTitleText>

        <View style={[a.w_full, a.pt_md, a.gap_lg]}>
          <Text style={[a.text_md, t.atoms.text_contrast_medium]}>
            {errorMessage}
          </Text>
        </View>

        <OnboardingControls.Portal>
          <View style={[a.gap_md, gtMobile && a.flex_row_reverse]}>
            <Button
              color="primary"
              size="large"
              label={_(msg`Try again`)}
              onPress={() => {
                setErrorMessage('')
                setSubStep('choose')
              }}>
              <ButtonText>
                <Trans>Try Again</Trans>
              </ButtonText>
            </Button>
            <Button
              color="secondary"
              size="large"
              label={_(msg`Search manually`)}
              onPress={() => {
                setErrorMessage('')
                setSubStep('manual')
              }}>
              <ButtonText>
                <Trans>Search Manually</Trans>
              </ButtonText>
            </Button>
          </View>
        </OnboardingControls.Portal>
      </View>
    )
  }

  return null
}

function FeatureLine({emoji, text}: {emoji: string; text: string}) {
  const t = useTheme()
  return (
    <View style={[a.flex_row, a.gap_sm, a.align_start]}>
      <Text emoji style={[a.text_md]}>
        {emoji}
      </Text>
      <Text style={[a.text_md, t.atoms.text, a.flex_1]}>{text}</Text>
    </View>
  )
}
