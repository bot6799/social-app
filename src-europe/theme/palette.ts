/**
 * Europe Social color palette.
 *
 * Overrides the Bluesky blue (#006AFF) with Europe blue (#003399).
 * All other colors (contrast, positive, negative) remain unchanged.
 *
 * The primary scale is generated from #003399 (HSL 220°, 100%, 30%).
 */

import {DEFAULT_PALETTE, DEFAULT_SUBDUED_PALETTE} from '@bsky.app/alf'

/**
 * Europe blue primary scale, anchored at #003399.
 */
const europePrimary = {
  primary_25: '#F2F4FA',
  primary_50: '#E3E8F4',
  primary_100: '#C7D1E9',
  primary_200: '#9BADD8',
  primary_300: '#6B84C4',
  primary_400: '#1A53B0',
  primary_500: '#003399',
  primary_600: '#002B80',
  primary_700: '#002266',
  primary_800: '#001A52',
  primary_900: '#00133D',
  primary_950: '#000F2E',
  primary_975: '#000B24',
} as const

/**
 * Europe blue subdued primary scale (for dark/dim themes).
 * Slightly desaturated and shifted for readability on dark backgrounds.
 */
const europeSubduedPrimary = {
  primary_25: '#F2F5FB',
  primary_50: '#E8EDF7',
  primary_100: '#D0DBEF',
  primary_200: '#A8BADE',
  primary_300: '#7C96CC',
  primary_400: '#4A6EB8',
  primary_500: '#1A4399',
  primary_600: '#153880',
  primary_700: '#122E66',
  primary_800: '#102552',
  primary_900: '#0E1D3D',
  primary_950: '#0C162E',
  primary_975: '#0A1124',
} as const

export const EUROPE_PALETTE = {
  ...DEFAULT_PALETTE,
  ...europePrimary,
}

export const EUROPE_SUBDUED_PALETTE = {
  ...DEFAULT_SUBDUED_PALETTE,
  ...europeSubduedPrimary,
}
