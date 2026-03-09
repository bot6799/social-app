import React, {useEffect} from 'react'

type Props = {
  isReady: boolean
}

export function Splash(props: React.PropsWithChildren<Props>) {
  useEffect(() => {
    if (props.isReady) {
      // Remove the HTML splash screen
      const el = document.getElementById('splash')
      if (el) el.style.display = 'none'
    }
  }, [props.isReady])

  // Render children once ready; HTML splash covers until dismissed above
  return <>{props.isReady ? props.children : null}</>
}
