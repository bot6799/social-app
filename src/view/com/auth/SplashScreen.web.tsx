import React from 'react'
import {Pressable, View} from 'react-native'
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'

import {useWebMediaQueries} from '#/lib/hooks/useWebMediaQueries'
import {useKawaiiMode} from '#/state/preferences/kawaii'
import {ErrorBoundary} from '#/view/com/util/ErrorBoundary'
import {Logo} from '#/view/icons/Logo'
import {Logotype} from '#/view/icons/Logotype'
import {
  AppClipOverlay,
  postAppClipMessage,
} from '#/screens/StarterPack/StarterPackLandingScreen'
import {atoms as a} from '#/alf'
import {AppLanguageDropdown} from '#/components/AppLanguageDropdown'
import {Button, ButtonText} from '#/components/Button'
import * as Layout from '#/components/Layout'
import {InlineLinkText} from '#/components/Link'
import {Text} from '#/components/Typography'

export const SplashScreen = ({
  onDismiss,
  onPressSignin,
  onPressCreateAccount,
}: {
  onDismiss?: () => void
  onPressSignin: () => void
  onPressCreateAccount: () => void
}) => {
  const {_} = useLingui()
  const {isTabletOrMobile: IS_WEB_MOBILE} = useWebMediaQueries()
  const [showClipOverlay, setShowClipOverlay] = React.useState(false)

  React.useEffect(() => {
    const getParams = new URLSearchParams(window.location.search)
    const clip = getParams.get('clip')
    if (clip === 'true') {
      setShowClipOverlay(true)
      postAppClipMessage({
        action: 'present',
      })
    }
  }, [])

  const kawaii = useKawaiiMode()

  return (
    <>
      {onDismiss && (
        <Pressable
          accessibilityRole="button"
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            padding: 20,
            zIndex: 100,
          }}
          onPress={onDismiss}>
          <FontAwesomeIcon
            icon="x"
            size={24}
            style={{
              color: '#FFFFFF',
            }}
          />
        </Pressable>
      )}

      <Layout.Center style={[a.h_full, a.flex_1, {backgroundColor: '#000000'}]} ignoreTabletLayoutOffset>
        <View
          testID="noSessionView"
          style={[
            a.h_full,
            a.justify_center,
            // @ts-expect-error web only
            {paddingBottom: '20vh'},
            IS_WEB_MOBILE && a.pb_5xl,
            {borderColor: '#333333'},
            a.align_center,
            a.gap_5xl,
            a.flex_1,
          ]}>
          <ErrorBoundary>
            <View style={[a.justify_center, a.align_center]}>
              <Logo width={kawaii ? 300 : 92} fill="white" />

              {!kawaii && (
                <View style={[a.pb_sm, a.pt_5xl]}>
                  <Logotype width={161} fill="#FFFFFF" />
                </View>
              )}

              <Text
                style={[
                  a.text_md,
                  a.font_semi_bold,
                  {color: '#999999'},
                ]}>
                <Trans>Europe's Square. Your Voice.</Trans>
              </Text>
            </View>

            <View
              testID="signinOrCreateAccount"
              style={[a.w_full, a.px_xl, a.gap_md, a.pb_2xl, {maxWidth: 320}]}>
              <Button
                testID="createAccountButton"
                onPress={onPressCreateAccount}
                label={_(msg`Create new account`)}
                accessibilityHint={_(
                  msg`Opens flow to create a new Europe Social account`,
                )}
                size="large"
                variant="solid"
                color="primary">
                <ButtonText>
                  <Trans>Create account</Trans>
                </ButtonText>
              </Button>
              <Button
                testID="signInButton"
                onPress={onPressSignin}
                label={_(msg`Sign in`)}
                accessibilityHint={_(
                  msg`Opens flow to sign in to your existing Europe Social account`,
                )}
                size="large"
                variant="solid"
                color="secondary_inverted">
                <ButtonText>
                  <Trans>Sign in</Trans>
                </ButtonText>
              </Button>
            </View>
          </ErrorBoundary>
        </View>
        <Footer />
      </Layout.Center>
      <AppClipOverlay
        visible={showClipOverlay}
        setIsVisible={setShowClipOverlay}
      />
    </>
  )
}

function Footer() {
  const {_} = useLingui()

  return (
    <View
      style={[
        a.absolute,
        a.inset_0,
        {top: 'auto'},
        a.px_xl,
        a.py_lg,
        a.border_t,
        a.flex_row,
        a.align_center,
        a.flex_wrap,
        a.gap_xl,
        a.flex_1,
        {borderTopColor: '#333333'},
      ]}>
      <Text style={[a.text_sm, {color: '#999999'}]}>
        <Trans>A fork of Bluesky, built for Europe</Trans>
      </Text>
      <InlineLinkText
        label={_(msg`Learn more about Bluesky`)}
        to="https://bsky.social"
        style={[{color: '#CCCCCC'}]}>
        <Trans>Powered by Bluesky</Trans>
      </InlineLinkText>
      <InlineLinkText
        label={_(msg`Learn about the AT Protocol`)}
        to="https://atproto.com"
        style={[{color: '#CCCCCC'}]}>
        <Trans>AT Protocol</Trans>
      </InlineLinkText>
      <InlineLinkText
        label={_(msg`Learn about Europe Social`)}
        to="https://europesocial.org"
        style={[{color: '#CCCCCC'}]}>
        <Trans>Learn about Europe Social</Trans>
      </InlineLinkText>

      <View style={a.flex_1} />

      <AppLanguageDropdown />
    </View>
  )
}
