/**
 * Europe Social brand logo - the "e" icon.
 *
 * Drop-in replacement for the upstream Bluesky butterfly Logo component.
 * Renders our "e" icon as an Image, accepting the same props interface.
 */
import React from 'react'
import {type ImageStyle, type TextProps} from 'react-native'
import {type PathProps, type SvgProps} from 'react-native-svg'
import {Image} from 'expo-image'

import {flatten} from '#/alf'

// Icon aspect ratio: height / width
const ratio = 1796 / 2466

type Props = {
  fill?: PathProps['fill']
  style?: TextProps['style']
} & Omit<SvgProps, 'style'>

export const Logo = React.forwardRef(function EuropeLogoImpl(
  props: Props,
  _ref,
) {
  const {fill, style: styleProp, ...rest} = props
  const styles = flatten(styleProp)
  // @ts-ignore matching upstream pattern
  const size = parseInt(rest.width || rest.size || 32, 10)

  // Use white icon on dark/colored backgrounds, blue icon otherwise
  const isWhite =
    fill === 'white' || fill === '#fff' || fill === '#ffffff' || fill === '#FFF'
  const source = isWhite
    ? require('../../assets/europe-icon-white.png')
    : require('../../assets/europe-icon-blue.png')

  return (
    <Image
      source={source}
      accessibilityLabel="Europe Social"
      accessibilityIgnoresInvertColors
      style={[{width: size, height: size * ratio}, styles as ImageStyle]}
      contentFit="contain"
    />
  )
})
