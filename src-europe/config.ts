import {Platform} from 'react-native'
import Constants from 'expo-constants'

const getDevHost = () => {
  if (Platform.OS === 'web') return 'localhost'
  // Auto-detect Expo dev server host for mobile
  return Constants.expoConfig?.hostUri?.split(':')[0] || 'localhost'
}

const DEV_HOST = getDevHost()

const IS_PRODUCTION =
  Platform.OS === 'web' &&
  typeof window !== 'undefined' &&
  (window.location?.hostname === 'eur.so' ||
    window.location?.hostname === 'app.eur.so')

const API_BASE = IS_PRODUCTION ? 'https://api.eur.so' : `http://${DEV_HOST}`

export const EUROPE_SOCIAL_CONFIG = {
  enabled: true,
  isProduction: IS_PRODUCTION,
  services: {
    zone: IS_PRODUCTION ? API_BASE : `${API_BASE}:8001`,
    zoneFeedGenerator: IS_PRODUCTION ? API_BASE : `${API_BASE}:8002`,
    translation: IS_PRODUCTION ? API_BASE : `${API_BASE}:8003`,
    incident: IS_PRODUCTION ? API_BASE : `${API_BASE}:8004`,
    gateway: IS_PRODUCTION ? API_BASE : `${API_BASE}:8000`,
  },
  translation: {
    autoDetect: true,
    preferredLanguages: ['en', 'es', 'fr', 'de'],
  },
  zones: {
    defaultZoneId: 'europe',
  },
} as const
