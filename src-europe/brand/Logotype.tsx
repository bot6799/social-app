/**
 * Europe Social brand logotype - "europe social" text mark.
 *
 * Drop-in replacement for the upstream Bluesky "Bluesky" text SVG.
 * Renders "europe social" as styled text, accepting the same props interface.
 */
import {Text} from 'react-native'
import {type PathProps, type SvgProps} from 'react-native-svg'

import {usePalette} from '#/lib/hooks/usePalette'

export function Logotype({
  fill,
  ...rest
}: {fill?: PathProps['fill']} & SvgProps) {
  const pal = usePalette('default')
  // @ts-ignore matching upstream pattern
  const size = parseInt(rest.width || 32)

  const color = fill || pal.text.color

  return (
    <Text
      accessibilityLabel="Europe Social"
      style={{
        fontFamily: 'InterVariable',
        fontSize: size * 0.17,
        fontWeight: '700',
        letterSpacing: 1.5,
        textTransform: 'lowercase',
        color: color as string,
        lineHeight: size * 0.22,
      }}>
      europe social
    </Text>
  )
}
