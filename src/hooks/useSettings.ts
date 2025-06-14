
import { useState, useEffect } from 'react'
import CryptoJS from 'crypto-js'

interface Settings {
  cerebrasApiKey: string
  cerebrasApiKeyValidated: boolean
  fontFamily: string
  fontSize: number
}

const defaultSettings: Settings = {
  cerebrasApiKey: '',
  cerebrasApiKeyValidated: false,
  fontFamily: 'Inter',
  fontSize: 16
}

const STORAGE_KEY = 'studio_settings'
const ENCRYPTION_KEY = 'studio_secret_key_2024'

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(defaultSettings)

  useEffect(() => {
    const loadSettings = () => {
      try {
        const encrypted = localStorage.getItem(STORAGE_KEY)
        if (encrypted) {
          const decrypted = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8)
          const parsed = JSON.parse(decrypted)
          setSettings({ ...defaultSettings, ...parsed })
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }

    loadSettings()
  }, [])

  const updateSettings = (newSettings: Settings) => {
    try {
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(newSettings), ENCRYPTION_KEY).toString()
      localStorage.setItem(STORAGE_KEY, encrypted)
      setSettings(newSettings)
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  return { settings, updateSettings }
}
