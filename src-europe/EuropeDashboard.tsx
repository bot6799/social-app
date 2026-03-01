import React, {useCallback, useEffect, useState} from 'react'
import {Pressable, StyleSheet, Text, View} from 'react-native'
import {useNavigation} from '@react-navigation/native'
import {Trans} from '@lingui/macro'

import {type NavigationProp} from '#/lib/routes/types'
import * as Layout from '#/components/Layout'
import {EUROPE_SOCIAL_CONFIG} from '#europe/config'

interface ServiceStatus {
  name: string
  url: string
  status: 'checking' | 'online' | 'offline'
  detail?: string
}

const INITIAL_SERVICES: ServiceStatus[] = [
  {name: 'Zone Service', url: EUROPE_SOCIAL_CONFIG.services.zone, status: 'checking'},
  {name: 'Translation Service', url: EUROPE_SOCIAL_CONFIG.services.translation, status: 'checking'},
  {name: 'Incident Service', url: EUROPE_SOCIAL_CONFIG.services.incident, status: 'checking'},
]

export function EuropeDashboard() {
  const navigation = useNavigation<NavigationProp>()
  const [services, setServices] = useState<ServiceStatus[]>(INITIAL_SERVICES)

  const checkServices = useCallback(async () => {
    const checks = INITIAL_SERVICES.map(async service => {
      try {
        const healthUrl = service.url.includes('8001')
          ? `${service.url}/zones/hierarchy`
          : service.url.includes('8003')
            ? `${service.url}/languages`
            : `${service.url}/incidents`
        const response = await fetch(healthUrl, {
          signal: AbortSignal.timeout(3000),
        })
        return {
          ...service,
          status: response.ok ? ('online' as const) : ('offline' as const),
          detail: response.ok ? `${response.status} OK` : `${response.status}`,
        }
      } catch {
        return {...service, status: 'offline' as const, detail: 'Unreachable'}
      }
    })

    const results = await Promise.all(checks)
    setServices(results)
  }, [])

  useEffect(() => {
    void checkServices()
  }, [checkServices])

  return (
    <Layout.Screen>
      <Layout.Header.Outer>
        <Layout.Header.BackButton />
        <Layout.Header.Content>
          <Layout.Header.TitleText>
            <Trans>Europe Social</Trans>
          </Layout.Header.TitleText>
          <Layout.Header.SubtitleText>
            Development Dashboard
          </Layout.Header.SubtitleText>
        </Layout.Header.Content>
        <Layout.Header.Slot />
      </Layout.Header.Outer>

      <Layout.Content>
        {/* Service Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SERVICE STATUS</Text>
          {services.map(service => (
            <View key={service.name} style={styles.serviceRow}>
              <View
                style={[
                  styles.statusDot,
                  service.status === 'online' && styles.statusOnline,
                  service.status === 'offline' && styles.statusOffline,
                  service.status === 'checking' && styles.statusChecking,
                ]}
              />
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceUrl}>{service.url}</Text>
              </View>
              <Text style={styles.serviceStatus}>
                {service.status === 'checking'
                  ? '...'
                  : service.detail ?? service.status}
              </Text>
            </View>
          ))}
          <Pressable style={styles.refreshButton} onPress={checkServices}>
            <Text style={styles.refreshText}>Refresh</Text>
          </Pressable>
        </View>

        {/* Navigation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FEATURES</Text>

          <Pressable
            style={styles.navButton}
            onPress={() => navigation.navigate('EuropeZones')}>
            <Text style={styles.navButtonTitle}>Zone Selector</Text>
            <Text style={styles.navButtonDesc}>
              Browse zone hierarchy, select home zone
            </Text>
          </Pressable>

          <Pressable
            style={styles.navButton}
            onPress={() => navigation.navigate('EuropeIncidents')}>
            <Text style={styles.navButtonTitle}>Incidents</Text>
            <Text style={styles.navButtonDesc}>
              View active incidents, verification status
            </Text>
          </Pressable>

          <Pressable
            style={styles.navButton}
            onPress={() => navigation.navigate('EuropeTranslation')}>
            <Text style={styles.navButtonTitle}>Translation</Text>
            <Text style={styles.navButtonDesc}>
              Test translation service, browse languages
            </Text>
          </Pressable>

          <Pressable
            style={styles.navButton}
            onPress={() => navigation.navigate('EuropeFeeds')}>
            <Text style={styles.navButtonTitle}>Zone Feeds</Text>
            <Text style={styles.navButtonDesc}>
              Browse and pin zone-based AT Protocol feeds
            </Text>
          </Pressable>
        </View>

        {/* Quick Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ARCHITECTURE</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Zone Service → PostGIS zone hierarchy + GPS resolution{'\n'}
              Translation Service → Multi-provider with Redis cache{'\n'}
              Incident Service → Clustering + verification + GeoJSON{'\n'}
              {'\n'}
              All services connect via REST APIs.{'\n'}
              Client code lives in src-europe/.
            </Text>
          </View>
        </View>
      </Layout.Content>
    </Layout.Screen>
  )
}

const styles = StyleSheet.create({
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#999999',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 0,
    marginRight: 12,
  },
  statusOnline: {
    backgroundColor: '#000000',
  },
  statusOffline: {
    backgroundColor: '#FF0000',
  },
  statusChecking: {
    backgroundColor: '#E5E5E5',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  serviceUrl: {
    fontSize: 11,
    color: '#999999',
  },
  serviceStatus: {
    fontSize: 12,
    color: '#666666',
  },
  refreshButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 0,
    alignSelf: 'flex-start',
  },
  refreshText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: 'bold',
  },
  navButton: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 0,
    marginBottom: 8,
  },
  navButtonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  navButtonDesc: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },
  infoBox: {
    padding: 16,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 0,
  },
  infoText: {
    fontSize: 13,
    color: '#333333',
    lineHeight: 20,
    fontFamily: 'monospace',
  },
})
