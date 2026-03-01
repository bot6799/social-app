import {useState} from 'react'
import {View} from 'react-native'
import * as Location from 'expo-location'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'

import {useSession} from '#/state/session'
import {useAddSavedFeedsMutation} from '#/state/queries/preferences'
import {atoms as a, useTheme} from '#/alf'
import {Button, ButtonText} from '#/components/Button'
import * as Dialog from '#/components/Dialog'
import * as TextField from '#/components/forms/TextField'
import {Loader} from '#/components/Loader'
import * as Toast from '#/components/Toast'
import {Text} from '#/components/Typography'

import {
  useSetHomeZoneMutation,
  useZoneSearchQuery,
  ZONE_KEYS,
} from '#europe/services/queries'
import {type Zone, type ZoneResolution, zoneAPI} from '#europe/services/zone-api'

type Step = 'idle' | 'detecting' | 'confirming' | 'manual' | 'saving' | 'error'

export function ZoneVerifyDialog({
  control,
}: {
  control: Dialog.DialogControlProps
}) {
  const {_} = useLingui()

  return (
    <Dialog.Outer control={control}>
      <Dialog.Handle />
      <Dialog.ScrollableInner label={_(msg`Set Home Zone`)}>
        <ZoneVerifyInner control={control} />
        <Dialog.Close />
      </Dialog.ScrollableInner>
    </Dialog.Outer>
  )
}

function ZoneVerifyInner({
  control,
}: {
  control: Dialog.DialogControlProps
}) {
  const t = useTheme()
  const {_} = useLingui()
  const {currentAccount} = useSession()
  const {mutateAsync: setHomeZone} = useSetHomeZoneMutation()
  const {mutateAsync: addSavedFeeds} = useAddSavedFeedsMutation()

  const [step, setStep] = useState<Step>('idle')
  const [resolution, setResolution] = useState<ZoneResolution | null>(null)
  const [manualZone, setManualZone] = useState<Zone | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const {data: searchResults} = useZoneSearchQuery(searchQuery)

  const startGPSDetection = async () => {
    setStep('detecting')
    try {
      const perm = await Location.requestForegroundPermissionsAsync()
      if (!perm.granted) {
        setErrorMessage(_(msg`Location permission denied. Please enable location access in your device settings.`))
        setStep('error')
        return
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })
      const {latitude, longitude} = position.coords

      const result = await zoneAPI.resolveLocation(latitude, longitude)
      setResolution(result)
      setStep('confirming')
    } catch (e) {
      setErrorMessage(
        e instanceof Error ? e.message : _(msg`Failed to detect location`),
      )
      setStep('error')
    }
  }

  const confirmZone = async (zone: Zone, chain: Zone[], verified: boolean) => {
    if (!currentAccount) return
    setStep('saving')
    try {
      await setHomeZone({
        did: currentAccount.did,
        zoneId: zone.id,
        verified,
      })

      // Auto-pin zone feeds for the resolved chain
      const feedsToPin = chain.map(z => ({
        type: 'feed' as const,
        value: `at://did:web:eur.so/app.bsky.feed.generator/${z.id}`,
        pinned: true,
      }))
      try {
        await addSavedFeeds(feedsToPin)
      } catch {
        // Feed generator may not exist yet — non-fatal
      }

      control.close(() => {
        Toast.show(_(msg`Home zone set to ${zone.name}!`))
      })
    } catch (e) {
      setErrorMessage(
        e instanceof Error ? e.message : _(msg`Failed to save home zone`),
      )
      setStep('error')
    }
  }

  const selectManualZone = (zone: Zone) => {
    setManualZone(zone)
  }

  const confirmManualZone = () => {
    if (!manualZone) return
    // For manual selection, the chain is just the zone itself
    void confirmZone(manualZone, [manualZone], false)
  }

  // -- Step: idle --
  if (step === 'idle') {
    return (
      <View style={[a.gap_lg]}>
        <Dialog.Header>
          <Dialog.HeaderText>
            <Trans>Set Home Zone</Trans>
          </Dialog.HeaderText>
        </Dialog.Header>
        <Text style={[a.text_sm, t.atoms.text_contrast_medium]}>
          <Trans>
            Your home zone determines your local feed and lets you post as a
            local. Verify with GPS to prove you're there.
          </Trans>
        </Text>
        <Button
          label={_(msg`Verify with GPS`)}
          onPress={startGPSDetection}
          color="primary"
          size="large">
          <ButtonText>
            <Trans>Verify with GPS</Trans>
          </ButtonText>
        </Button>
        <Button
          label={_(msg`Set manually`)}
          onPress={() => setStep('manual')}
          color="secondary"
          size="large"
          variant="outline">
          <ButtonText>
            <Trans>Set Manually</Trans>
          </ButtonText>
        </Button>
      </View>
    )
  }

  // -- Step: detecting --
  if (step === 'detecting') {
    return (
      <View style={[a.gap_md, a.align_center, a.py_xl]}>
        <Loader size="lg" />
        <Text style={[a.text_sm, t.atoms.text_contrast_medium]}>
          <Trans>Detecting your location...</Trans>
        </Text>
      </View>
    )
  }

  // -- Step: confirming (GPS) --
  if (step === 'confirming' && resolution) {
    return (
      <View style={[a.gap_lg]}>
        <Dialog.Header>
          <Dialog.HeaderText>
            <Trans>Confirm Home Zone</Trans>
          </Dialog.HeaderText>
        </Dialog.Header>
        <View
          style={[
            a.p_md,
            a.border,
            t.atoms.border_contrast_low,
            t.atoms.bg_contrast_25,
          ]}>
          <Text style={[a.text_lg, a.font_bold, t.atoms.text]}>
            {resolution.zone.name}
          </Text>
          <Text
            style={[a.text_xs, t.atoms.text_contrast_medium, a.mt_xs]}>
            {resolution.chain.map(z => z.name).join(' \u203A ')}
          </Text>
        </View>
        <Text style={[a.text_sm, t.atoms.text_contrast_medium]}>
          <Trans>
            This zone was detected via GPS and will be marked as verified.
          </Trans>
        </Text>
        <Button
          label={_(msg`Confirm as home zone`)}
          onPress={() =>
            confirmZone(resolution.zone, resolution.chain, true)
          }
          color="primary"
          size="large">
          <ButtonText>
            <Trans>Confirm as Home Zone</Trans>
          </ButtonText>
        </Button>
        <Button
          label={_(msg`Cancel`)}
          onPress={() => {
            setResolution(null)
            setStep('idle')
          }}
          color="secondary"
          size="large"
          variant="outline">
          <ButtonText>
            <Trans>Cancel</Trans>
          </ButtonText>
        </Button>
      </View>
    )
  }

  // -- Step: manual search --
  if (step === 'manual') {
    return (
      <View style={[a.gap_md]}>
        <Dialog.Header>
          <Dialog.HeaderText>
            <Trans>Search Zones</Trans>
          </Dialog.HeaderText>
        </Dialog.Header>
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
                color={manualZone?.id === zone.id ? 'primary' : 'secondary'}
                size="small"
                variant={manualZone?.id === zone.id ? 'solid' : 'outline'}>
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
          <Text style={[a.text_sm, t.atoms.text_contrast_medium, a.py_sm]}>
            <Trans>No zones found for "{searchQuery}"</Trans>
          </Text>
        ) : (
          <Text style={[a.text_sm, t.atoms.text_contrast_medium, a.py_sm]}>
            <Trans>Type at least 2 characters to search</Trans>
          </Text>
        )}
        {manualZone && (
          <View style={[a.gap_sm, a.mt_sm]}>
            <View
              style={[
                a.p_md,
                a.border,
                t.atoms.border_contrast_low,
                t.atoms.bg_contrast_25,
              ]}>
              <Text style={[a.text_md, a.font_bold]}>
                {manualZone.name}
              </Text>
              <Text style={[a.text_xs, t.atoms.text_contrast_medium]}>
                {manualZone.level}
                {manualZone.parent_id ? ` \u2022 ${manualZone.parent_id}` : ''}
              </Text>
            </View>
            <Text style={[a.text_xs, t.atoms.text_contrast_medium]}>
              <Trans>
                Manual selection will not be marked as verified.
              </Trans>
            </Text>
            <Button
              label={_(msg`Set as home zone`)}
              onPress={confirmManualZone}
              color="primary"
              size="large">
              <ButtonText>
                <Trans>Set as Home Zone</Trans>
              </ButtonText>
            </Button>
          </View>
        )}
        <Button
          label={_(msg`Back`)}
          onPress={() => {
            setManualZone(null)
            setSearchQuery('')
            setStep('idle')
          }}
          color="secondary"
          size="small"
          variant="outline">
          <ButtonText>
            <Trans>Back</Trans>
          </ButtonText>
        </Button>
      </View>
    )
  }

  // -- Step: saving --
  if (step === 'saving') {
    return (
      <View style={[a.gap_md, a.align_center, a.py_xl]}>
        <Loader size="lg" />
        <Text style={[a.text_sm, t.atoms.text_contrast_medium]}>
          <Trans>Saving your home zone...</Trans>
        </Text>
      </View>
    )
  }

  // -- Step: error --
  if (step === 'error') {
    return (
      <View style={[a.gap_lg]}>
        <Dialog.Header>
          <Dialog.HeaderText>
            <Trans>Something went wrong</Trans>
          </Dialog.HeaderText>
        </Dialog.Header>
        <Text style={[a.text_sm, t.atoms.text_contrast_medium]}>
          {errorMessage}
        </Text>
        <Button
          label={_(msg`Try again`)}
          onPress={() => {
            setErrorMessage('')
            setStep('idle')
          }}
          color="primary"
          size="large">
          <ButtonText>
            <Trans>Try Again</Trans>
          </ButtonText>
        </Button>
        <Button
          label={_(msg`Search manually`)}
          onPress={() => {
            setErrorMessage('')
            setStep('manual')
          }}
          color="secondary"
          size="large"
          variant="outline">
          <ButtonText>
            <Trans>Search Manually</Trans>
          </ButtonText>
        </Button>
      </View>
    )
  }

  return null
}
