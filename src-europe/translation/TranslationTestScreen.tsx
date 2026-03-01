import React, {useState} from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import {Trans} from '@lingui/macro'

import * as Layout from '#/components/Layout'
import {useSupportedLanguagesQuery} from '#europe/services/queries'
import {translationAPI, type TranslateResponse} from '#europe/services/translation-api'

export function TranslationTestScreen() {
  const [inputText, setInputText] = useState(
    'Hola, esto es una prueba de traduccion para Europe Social.',
  )
  const [targetLang, setTargetLang] = useState('en')
  const [result, setResult] = useState<TranslateResponse | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {data: languages} = useSupportedLanguagesQuery()

  const handleTranslate = async () => {
    setIsTranslating(true)
    setError(null)
    try {
      const response = await translationAPI.translate({
        text: inputText,
        target_lang: targetLang,
      })
      setResult(response)
    } catch (e) {
      setError(String(e))
    } finally {
      setIsTranslating(false)
    }
  }

  return (
    <Layout.Screen>
      <Layout.Header.Outer>
        <Layout.Header.BackButton />
        <Layout.Header.Content>
          <Layout.Header.TitleText>
            <Trans>Translation</Trans>
          </Layout.Header.TitleText>
        </Layout.Header.Content>
        <Layout.Header.Slot />
      </Layout.Header.Outer>

      <Layout.Content>
        <View style={styles.section}>
          <Text style={styles.label}>Input Text</Text>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            multiline
            numberOfLines={4}
            placeholder="Enter text to translate..."
            placeholderTextColor="#999999"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Target Language</Text>
          <View style={styles.langGrid}>
            {(languages ?? [{code: 'en', name: 'English', native_name: 'English'},
              {code: 'es', name: 'Spanish', native_name: 'Espanol'},
              {code: 'fr', name: 'French', native_name: 'Francais'},
              {code: 'de', name: 'German', native_name: 'Deutsch'},
              {code: 'it', name: 'Italian', native_name: 'Italiano'},
              {code: 'pt', name: 'Portuguese', native_name: 'Portugues'},
            ])
              .slice(0, 12)
              .map(lang => (
                <Pressable
                  key={lang.code}
                  style={[
                    styles.langButton,
                    targetLang === lang.code && styles.langButtonActive,
                  ]}
                  onPress={() => setTargetLang(lang.code)}>
                  <Text
                    style={[
                      styles.langText,
                      targetLang === lang.code && styles.langTextActive,
                    ]}>
                    {lang.code.toUpperCase()}
                  </Text>
                  <Text
                    style={[
                      styles.langName,
                      targetLang === lang.code && styles.langNameActive,
                    ]}>
                    {lang.name}
                  </Text>
                </Pressable>
              ))}
          </View>
        </View>

        <Pressable
          style={[styles.translateButton, isTranslating && styles.translateButtonDisabled]}
          onPress={handleTranslate}
          disabled={isTranslating}>
          {isTranslating ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.translateButtonText}>Translate</Text>
          )}
        </Pressable>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Error: {error}</Text>
            <Text style={styles.errorHint}>
              Is the Translation Service running on :8003?
            </Text>
          </View>
        )}

        {result && (
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>Translation</Text>
            <Text style={styles.resultText}>{result.translated_text}</Text>
            <View style={styles.resultMeta}>
              <Text style={styles.metaText}>
                {result.source_lang} → {result.target_lang}
              </Text>
              <Text style={styles.metaText}>Provider: {result.provider}</Text>
              <Text style={styles.metaText}>
                Confidence: {(result.confidence * 100).toFixed(0)}%
              </Text>
              <Text style={styles.metaText}>
                Cached: {result.cached === true ? 'Yes' : result.cached === false ? 'No' : 'N/A'}
              </Text>
            </View>
          </View>
        )}
      </Layout.Content>
    </Layout.Screen>
  )
}

const styles = StyleSheet.create({
  section: {
    padding: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 0,
    padding: 12,
    fontSize: 15,
    color: '#000000',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  langButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 0,
    minWidth: 80,
  },
  langButtonActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  langText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000000',
  },
  langTextActive: {
    color: '#FFFFFF',
  },
  langName: {
    fontSize: 11,
    color: '#999999',
  },
  langNameActive: {
    color: '#666666',
  },
  translateButton: {
    marginHorizontal: 16,
    backgroundColor: '#000000',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 0,
  },
  translateButtonDisabled: {
    backgroundColor: '#666666',
  },
  translateButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  errorBox: {
    margin: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FF0000',
    borderRadius: 0,
  },
  errorText: {
    fontSize: 13,
    color: '#FF0000',
    marginBottom: 4,
  },
  errorHint: {
    fontSize: 12,
    color: '#999999',
  },
  resultBox: {
    margin: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 0,
    backgroundColor: '#FAFAFA',
  },
  resultLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultText: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 24,
    marginBottom: 12,
  },
  resultMeta: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingTop: 8,
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#999999',
  },
})
