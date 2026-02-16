import {useState} from 'react'
import {Pressable, View} from 'react-native'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'

import {atoms as a, useTheme} from '#/alf'
import {InlineLinkText} from '#/components/Link'
import {Text} from '#/components/Typography'

import {useIncidentsQuery} from '#europe/services/queries'
import {type SidebarIncident} from '#europe/services/zone-api'

const SEVERITY_LABELS: Record<string, string> = {
  critical: 'CRITICAL',
  major: 'MAJOR',
  minor: 'MINOR',
  info: 'INFO',
}

function SeverityBadge({severity}: {severity: string}) {
  const isCritical = severity === 'critical'

  return (
    <View
      style={[
        a.px_xs,
        a.py_2xs,
        {
          backgroundColor: isCritical ? '#FF0000' : '#000000',
          minWidth: 44,
          alignItems: 'center',
        },
      ]}>
      <Text
        style={[
          a.text_2xs,
          a.font_bold,
          {color: '#FFFFFF', letterSpacing: 0.5},
        ]}>
        {SEVERITY_LABELS[severity] ?? severity.toUpperCase()}
      </Text>
    </View>
  )
}

type IncidentItem = {
  id: string
  title: string | null
  incident_type: string
  severity: string
}

export function SidebarIncidents({
  incidents: incidentsProp,
}: {
  incidents?: SidebarIncident[]
}) {
  const t = useTheme()
  const {_} = useLingui()
  const [expanded, setExpanded] = useState(true)

  // Use prop data if provided, otherwise fetch our own
  const shouldFetch = !incidentsProp
  const {data: fetchedIncidents, error} = useIncidentsQuery(
    shouldFetch ? {status: 'active'} : undefined,
  )

  const items: IncidentItem[] | undefined = incidentsProp
    ? incidentsProp.map(inc => ({
        id: inc.id,
        title: inc.title,
        incident_type: inc.incident_type,
        severity: inc.severity,
      }))
    : fetchedIncidents?.map(inc => ({
        id: inc.id,
        title: inc.title,
        incident_type: inc.incident_type,
        severity: inc.severity,
      }))

  // Graceful degradation: if service is down or no incidents, render nothing
  if (!incidentsProp && error) return null
  if (!items || items.length === 0) return null

  const top3 = items.slice(0, 3)

  return (
    <View style={[a.gap_xs]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={_(msg`Toggle incidents section`)}
        accessibilityHint={_(msg`Expands or collapses the incidents list`)}
        onPress={() => setExpanded(v => !v)}
        style={[a.flex_row, a.align_center, a.gap_xs]}>
        <Text
          style={[
            a.text_2xs,
            a.font_bold,
            t.atoms.text_contrast_low,
            {letterSpacing: 1.5},
          ]}>
          {expanded ? '\u25BE' : '\u25B8'} <Trans>WHAT'S HAPPENING</Trans>
        </Text>
      </Pressable>

      {expanded && (
        <View style={[a.gap_xs]}>
          {top3.map(incident => (
            <View
              key={incident.id}
              style={[a.flex_row, a.align_center, a.gap_sm]}>
              <SeverityBadge severity={incident.severity} />
              <Text
                style={[a.text_xs, a.flex_1, t.atoms.text]}
                numberOfLines={1}>
                {incident.title ?? incident.incident_type}
              </Text>
            </View>
          ))}

          <InlineLinkText
            to="/europe/incidents"
            label={_(msg`View all incidents`)}
            style={[a.text_xs, t.atoms.text_contrast_medium]}>
            <Trans>View all</Trans> {'\u2192'}
          </InlineLinkText>
        </View>
      )}
    </View>
  )
}
