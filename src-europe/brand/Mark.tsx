/**
 * Europe Social mark - the "e" icon for icon-system contexts.
 *
 * Drop-in replacement for the upstream Bluesky butterfly Mark component.
 * Works with the icon system's Props interface (size prop, etc.).
 */
import {type ImageStyle} from 'react-native'
import {Image} from 'expo-image'

import {
  type Props,
  sizes,
  useCommonSVGProps,
} from '#/components/icons/common'

const ratio = 1796 / 2466

export function Mark(props: Props) {
  const {fill, size, style} = useCommonSVGProps(props)

  const isWhite =
    typeof fill === 'string' &&
    (fill === 'white' || fill === '#fff' || fill === '#ffffff')

  const source = isWhite
    ? require('../../assets/europe-icon-white.png')
    : require('../../assets/europe-icon-blue.png')

  return (
    <Image
      source={source}
      accessibilityLabel="Europe Social"
      accessibilityIgnoresInvertColors
      style={[{width: size, height: size * ratio}, style as ImageStyle]}
      contentFit="contain"
    />
  )
}
