import React, {useState} from 'react'
import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native'
import {Trans} from '@lingui/macro'

import * as Layout from '#/components/Layout'
import {useIncidentsQuery} from '#europe/services/queries'
import {type Incident} from '#europe/services/incident-api'

const SEVERITY_LABELS: Record<string, string> = {
  critical: 'CRITICAL',
  major: 'MAJOR',
  minor: 'MINOR',
  info: 'INFO',
}

const TYPE_LABELS: Record<string, string> = {
  protest: 'Protest',
  emergency: 'Emergency',
  infrastructure: 'Infrastructure',
  weather: 'Weather',
  political: 'Political',
  cultural: 'Cultural',
  sports: 'Sports',
  other: 'Other',
}

export function IncidentsScreen() {
  const [filter, setFilter] = useState<string | undefined>(undefined)
  const {data: incidents, isLoading, error, refetch} = useIncidentsQuery(
    filter ? {status: filter} : undefined,
  )

  return (
    <Layout.Screen>
      <Layout.Header.Outer>
        <Layout.Header.BackButton />
        <Layout.Header.Content>
          <Layout.Header.TitleText>
            <Trans>Incidents</Trans>
          </Layout.Header.TitleText>
          <Layout.Header.SubtitleText>
            {incidents?.length ?? 0} incident{incidents?.length !== 1 ? 's' : ''}
          </Layout.Header.SubtitleText>
        </Layout.Header.Content>
        <Layout.Header.Slot />
      </Layout.Header.Outer>

      <Layout.Content>
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.loadingText}>Loading incidents...</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>
              Failed to load incidents. Is the Incident Service running on :8004?
            </Text>
            <Text style={styles.errorDetail}>{String(error)}</Text>
          </View>
        ) : (
          <>
            <View style={styles.filters}>
              {['all', 'unverified', 'crowdsourced', 'journalist', 'official', 'closed'].map(f => (
                <Pressable
                  key={f}
                  style={[
                    styles.filterButton,
                    (filter === f || (!filter && f === 'all')) &&
                      styles.filterButtonActive,
                  ]}
                  onPress={() => setFilter(f === 'all' ? undefined : f)}>
                  <Text
                    style={[
                      styles.filterText,
                      (filter === f || (!filter && f === 'all')) &&
                        styles.filterTextActive,
                    ]}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>

            {incidents && incidents.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No incidents found</Text>
                <Pressable style={styles.refreshButton} onPress={() => refetch()}>
                  <Text style={styles.refreshText}>Refresh</Text>
                </Pressable>
              </View>
            )}

            {incidents?.map(incident => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </>
        )}
      </Layout.Content>
    </Layout.Screen>
  )
}

function IncidentCard({incident}: {incident: Incident}) {
  const isCritical = incident.severity === 'critical'
  const isEmergency = incident.incident_type === 'emergency'

  return (
    <View
      style={[
        styles.card,
        (isCritical || isEmergency) && styles.cardEmergency,
      ]}>
      <View style={styles.cardHeader}>
        <Text
          style={[
            styles.severity,
            (isCritical || isEmergency) && styles.severityEmergency,
          ]}>
          {SEVERITY_LABELS[incident.severity] ?? incident.severity}
        </Text>
        <Text style={styles.type}>
          {TYPE_LABELS[incident.incident_type] ?? incident.incident_type}
        </Text>
        <Text style={styles.status}>{incident.status}</Text>
      </View>

      <Text
        style={[
          styles.cardTitle,
          (isCritical || isEmergency) && styles.cardTitleEmergency,
        ]}>
        {incident.title}
      </Text>

      {incident.description && (
        <Text style={styles.cardDescription}>{incident.description}</Text>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.cardMeta}>
          {incident.reporter_count} reporter{incident.reporter_count !== 1 ? 's' : ''}
          {incident.zone_id ? ` | ${incident.zone_id}` : ''}
        </Text>
        <Text style={styles.cardTime}>
          {new Date(incident.last_updated_at).toLocaleString()}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#666666',
  },
  errorText: {
    fontSize: 15,
    color: '#000000',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 13,
    color: '#999999',
    textAlign: 'center',
  },
  filters: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 0,
  },
  filterButtonActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  filterText: {
    fontSize: 13,
    color: '#000000',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#999999',
    marginBottom: 16,
  },
  refreshButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 0,
  },
  refreshText: {
    fontSize: 13,
    color: '#000000',
    fontWeight: 'bold',
  },
  card: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  cardEmergency: {
    backgroundColor: '#FF0000',
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  severity: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 0,
  },
  severityEmergency: {
    color: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  type: {
    fontSize: 11,
    color: '#666666',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 0,
  },
  status: {
    fontSize: 11,
    color: '#999999',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  cardTitleEmergency: {
    color: '#FFFFFF',
  },
  cardDescription: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardMeta: {
    fontSize: 12,
    color: '#999999',
  },
  cardTime: {
    fontSize: 12,
    color: '#999999',
  },
})
