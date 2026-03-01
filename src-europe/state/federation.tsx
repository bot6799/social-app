import React from 'react'

import * as persisted from '#/state/persisted'

type StateContext = boolean
type SetContext = (v: boolean) => void

const stateContext = React.createContext<StateContext>(
  persisted.defaults.federationEnabled ?? true,
)
stateContext.displayName = 'FederationStateContext'
const setContext = React.createContext<SetContext>((_: boolean) => {})
setContext.displayName = 'FederationSetContext'

export function Provider({children}: {children: React.ReactNode}) {
  const [state, setState] = React.useState(
    persisted.get('federationEnabled') ?? true,
  )

  const setStateWrapped = React.useCallback(
    (federationEnabled: boolean) => {
      setState(federationEnabled)
      persisted.write('federationEnabled', federationEnabled)
    },
    [setState],
  )

  React.useEffect(() => {
    return persisted.onUpdate('federationEnabled', nextFederationEnabled => {
      setState(nextFederationEnabled ?? true)
    })
  }, [setStateWrapped])

  return (
    <stateContext.Provider value={state}>
      <setContext.Provider value={setStateWrapped}>
        {children}
      </setContext.Provider>
    </stateContext.Provider>
  )
}

export const useFederationEnabled = () => React.useContext(stateContext)
export const useSetFederationEnabled = () => React.useContext(setContext)
