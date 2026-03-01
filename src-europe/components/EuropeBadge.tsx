import React from 'react'
import {View} from 'react-native'
import Svg, {Circle} from 'react-native-svg'

import {useTheme} from '#/alf'

/**
 * Small monochrome badge indicating a eur.so network user.
 * Design: circle of 12 dots (EU stars motif) rendered in theme text color.
 * Sized to match the VerificationCheck icon (~12-13px).
 */
export function EuropeBadge({width = 12}: {width?: number}) {
  const t = useTheme()
  const fill = t.atoms.text.color as string

  // 12 dots arranged in a circle (EU flag star positions)
  const dots = []
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30 - 90) * (Math.PI / 180)
    const cx = 12 + 8 * Math.cos(angle)
    const cy = 12 + 8 * Math.sin(angle)
    dots.push(<Circle key={i} cx={cx} cy={cy} r={1.5} fill={fill} />)
  }

  return (
    <View accessibilityLabel="Europe Social user" accessibilityRole="image">
      <Svg
        fill="none"
        viewBox="0 0 24 24"
        width={width}
        height={width}>
        {dots}
      </Svg>
    </View>
  )
}

/**
 * Check if a handle belongs to the eur.so network.
 */
export function isEuropeHandle(handle: string): boolean {
  return handle.endsWith('.eur.so')
}
