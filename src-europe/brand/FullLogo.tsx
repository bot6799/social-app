/**
 * Europe Social full logo - icon + "eur.so" text combined.
 *
 * Drop-in replacement for the upstream Bluesky Full (butterfly + "Bluesky" text) component.
 * Renders the eurso.png full logo image.
 */
import {type ImageStyle} from 'react-native'
import {Image} from 'expo-image'

import {type Props, useCommonSVGProps} from '#/components/icons/common'

export function Full(
  props: Omit<Props, 'fill' | 'size' | 'height'> & {
    markFill?: Props['fill']
    textFill?: Props['fill']
  },
) {
  const {fill, size, style} = useCommonSVGProps(props)
  // Original ratio: 123/555, our logo ratio: 706/2544 ≈ 0.277
  const ratio = 706 / 2544

  return (
    <Image
      source={require('../../assets/europe-logo-full.png')}
      accessibilityLabel="Europe Social"
      accessibilityIgnoresInvertColors
      style={[{width: size, height: size * ratio}, style as ImageStyle]}
      contentFit="contain"
    />
  )
}
