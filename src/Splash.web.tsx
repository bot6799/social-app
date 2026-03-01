/*
 * This is a reimplementation of what exists in our HTML template files
 * already. Once the React tree mounts, this is what gets rendered first, until
 * the app is ready to go.
 */

// Europe Social: use our brand logo instead of butterfly SVG
import {View} from 'react-native'

import {Logo} from '#europe/brand/Logo'
import {atoms as a} from '#/alf'

export function Splash() {
  return (
    <View style={[a.fixed, a.inset_0, a.align_center, a.justify_center]}>
      <Logo width={100} style={{position: 'relative', top: -50}} />
    </View>
  )
}
