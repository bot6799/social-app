import {Pressable, View} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import Svg, {Circle, Line, Path} from 'react-native-svg'
import {msg} from '@lingui/macro'
import {useLingui} from '@lingui/react'

import {atoms as a, useTheme} from '#/alf'
import {Text} from '#/components/Typography'

const AnimatedSvg = Animated.createAnimatedComponent(View)

// Simplified Europe outline (continent shape)
const EUROPE_PATH =
  'M25,8 L30,5 L38,6 L42,3 L48,5 L46,10 L50,12 L48,18 L44,16 L40,20 L42,25 L38,28 L35,32 L30,35 L28,40 L24,42 L20,38 L16,40 L12,36 L8,32 L10,28 L14,24 L12,20 L8,16 L10,12 L14,10 L18,12 L22,10 Z'

// Globe path from upstream Globe icon, scaled for our use
const GLOBE_PATH =
  'M30,2 C14.536,2 2,14.536 2,30 C2,45.464 14.536,58 30,58 C45.464,58 58,45.464 58,30 C58,14.536 45.464,2 30,2 Z M30,6 C28.86,6 27.4,6.5 25.65,8.16 C23.88,9.85 22.06,12.53 20.72,16.56 L39.28,16.56 C37.94,12.53 36.12,9.85 34.35,8.16 C32.6,6.5 31.14,6 30,6 Z M18.8,16.56 C20.32,11.76 22.74,8.04 25.72,5.82 C18.28,7.42 12.12,12.1 8.92,18.4 L16.1,18.4 C16.84,17.7 17.68,17.08 18.62,16.56 Z M8.12,22 L16.02,22 C15.5,25.1 15.22,28.5 15.14,32 L6.12,32 C6.42,28.5 7.08,25.14 8.12,22 Z M6.12,36 L15.14,36 C15.22,39.5 15.5,42.9 16.02,46 L8.12,46 C7.08,42.86 6.42,39.5 6.12,36 Z'

export function FederationMapToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean
  onToggle: () => void
}) {
  const t = useTheme()
  const {_} = useLingui()
  const globeOpacity = useSharedValue(enabled ? 1 : 0.25)
  const lineOpacity = useSharedValue(enabled ? 1 : 0)

  // Animate on prop change
  globeOpacity.value = withTiming(enabled ? 1 : 0.25, {duration: 300})
  lineOpacity.value = withTiming(enabled ? 1 : 0, {duration: 300})

  const globeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: globeOpacity.value,
  }))

  const lineAnimatedStyle = useAnimatedStyle(() => ({
    opacity: lineOpacity.value,
  }))

  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityLabel={_(
        msg`Toggle federation mode. Currently ${enabled ? 'open network' : 'Europe only'}`,
      )}
      style={[
        a.w_full,
        a.align_center,
        a.py_lg,
        a.px_lg,
        a.border,
        t.atoms.border_contrast_low,
        t.atoms.bg_contrast_25,
      ]}>
      <View style={[a.flex_row, a.align_center, a.justify_center, a.gap_lg]}>
        {/* Europe SVG - always fully visible */}
        <View style={[a.align_center]}>
          <Svg width={60} height={50} viewBox="0 0 60 50">
            <Path
              d={EUROPE_PATH}
              fill={t.palette.contrast_900}
              stroke={t.palette.contrast_900}
              strokeWidth={1}
            />
          </Svg>
          <Text
            style={[
              a.text_xs,
              a.text_center,
              a.mt_xs,
              a.font_bold,
              !enabled ? {color: t.palette.contrast_900} : t.atoms.text_contrast_medium,
            ]}>
            eur.so
          </Text>
        </View>

        {/* Connection line between maps */}
        <AnimatedSvg style={[lineAnimatedStyle, a.align_center, a.justify_center]}>
          <Svg width={40} height={8} viewBox="0 0 40 8">
            <Line
              x1={0}
              y1={4}
              x2={40}
              y2={4}
              stroke={t.palette.contrast_900}
              strokeWidth={2}
              strokeDasharray="4,3"
            />
            <Circle cx={2} cy={4} r={3} fill={t.palette.contrast_900} />
            <Circle cx={38} cy={4} r={3} fill={t.palette.contrast_900} />
          </Svg>
        </AnimatedSvg>

        {/* Globe SVG - fades when Europe Only */}
        <AnimatedSvg style={[globeAnimatedStyle, a.align_center]}>
          <Svg width={60} height={60} viewBox="0 0 60 60">
            <Circle
              cx={30}
              cy={30}
              r={26}
              fill="none"
              stroke={t.palette.contrast_900}
              strokeWidth={2}
            />
            {/* Horizontal lines for globe latitude */}
            <Line
              x1={6}
              y1={20}
              x2={54}
              y2={20}
              stroke={t.palette.contrast_900}
              strokeWidth={1}
            />
            <Line
              x1={4}
              y1={30}
              x2={56}
              y2={30}
              stroke={t.palette.contrast_900}
              strokeWidth={1}
            />
            <Line
              x1={6}
              y1={40}
              x2={54}
              y2={40}
              stroke={t.palette.contrast_900}
              strokeWidth={1}
            />
            {/* Vertical meridian curves approximated as lines */}
            <Line
              x1={30}
              y1={4}
              x2={30}
              y2={56}
              stroke={t.palette.contrast_900}
              strokeWidth={1}
            />
            <Path
              d="M20,6 Q12,30 20,54"
              fill="none"
              stroke={t.palette.contrast_900}
              strokeWidth={1}
            />
            <Path
              d="M40,6 Q48,30 40,54"
              fill="none"
              stroke={t.palette.contrast_900}
              strokeWidth={1}
            />
          </Svg>
          <Text
            style={[
              a.text_xs,
              a.text_center,
              a.mt_xs,
              a.font_bold,
              enabled ? {color: t.palette.contrast_900} : t.atoms.text_contrast_medium,
            ]}>
            AT Protocol
          </Text>
        </AnimatedSvg>
      </View>

      {/* Toggle indicator */}
      <View
        style={[
          a.flex_row,
          a.align_center,
          a.justify_center,
          a.mt_lg,
          a.gap_sm,
        ]}>
        <View
          style={[
            {
              width: 44,
              height: 24,
              borderRadius: 12,
              backgroundColor: enabled
                ? t.palette.contrast_900
                : t.palette.contrast_200,
              justifyContent: 'center',
              paddingHorizontal: 2,
            },
          ]}>
          <View
            style={[
              {
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: enabled
                  ? t.palette.contrast_25
                  : t.palette.contrast_500,
                alignSelf: enabled ? 'flex-end' : 'flex-start',
              },
            ]}
          />
        </View>
        <Text
          style={[
            a.text_sm,
            a.font_bold,
            enabled ? {color: t.palette.contrast_900} : t.atoms.text_contrast_medium,
          ]}>
          {enabled ? _( msg`Open Network`) : _(msg`Europe Only`)}
        </Text>
      </View>
    </Pressable>
  )
}
