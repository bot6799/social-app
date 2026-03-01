import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

interface EuropeLogotypeProps {
  size?: 'small' | 'medium' | 'large'
  color?: string
}

export function EuropeLogotype({
  size = 'medium',
  color = '#000000',
}: EuropeLogotypeProps) {
  const fontSize = size === 'small' ? 16 : size === 'medium' ? 24 : 36

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.text,
          {
            fontSize,
            color,
            letterSpacing: -fontSize * 0.04,
          },
        ]}>
        eur.so
      </Text>
    </View>
  )
}

export function EuropeWordmark({color = '#000000'}: {color?: string}) {
  return (
    <View style={styles.wordmarkContainer}>
      <Text style={[styles.wordmark, {color}]}>Europe Social</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontWeight: '900',
  },
  wordmarkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordmark: {
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: -0.3,
  },
})
