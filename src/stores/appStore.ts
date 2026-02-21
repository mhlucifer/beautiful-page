import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useDatabaseStore } from './databaseStore'

export type Theme = 'light' | 'dark' | 'system'
export type LayoutMode = 'three-column' | 'two-column' | 'focus'

export interface AppSettings {
  theme: Theme
  layout: LayoutMode
  sidebarWidth: number
  rightPanelWidth: number
  autosaveInterval: number // seconds
  fontSize: number
  fontFamily: string
  lineHeight: number
}

const defaultSettings: AppSettings = {
  theme: 'system',
  layout: 'three-column',
  sidebarWidth: 280,
  rightPanelWidth: 320,
  autosaveInterval: 30,
  fontSize: 16,
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
  lineHeight: 1.6,
}

export const useAppStore = defineStore('app', () => {
  // State
  const isInitialized = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const settings = ref<AppSettings>({ ...defaultSettings })
  const activePanel = ref<string>('explorer')
  const isSidebarCollapsed = ref(false)
  const isRightPanelCollapsed = ref(false)

  // Getters
  const currentTheme = computed(() => {
    if (settings.value.theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return settings.value.theme
  })

  const isDark = computed(() => currentTheme.value === 'dark')

  const effectiveSidebarWidth = computed(() => 
    isSidebarCollapsed.value ? 48 : settings.value.sidebarWidth
  )

  const effectiveRightPanelWidth = computed(() => 
    isRightPanelCollapsed.value ? 0 : settings.value.rightPanelWidth
  )

  // Actions
  async function initialize() {
    if (isInitialized.value) return

    isLoading.value = true
    error.value = null

    try {
      // Load settings from localStorage
      loadSettings()

      // Initialize database
      const dbStore = useDatabaseStore()
      await dbStore.initialize()

      // Apply theme
      applyTheme()

      isInitialized.value = true
    } catch (err) {
      console.error('Failed to initialize app:', err)
      error.value = err instanceof Error ? err.message : '初始化失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function loadSettings() {
    try {
      const saved = localStorage.getItem('nanke:settings')
      if (saved) {
        const parsed = JSON.parse(saved)
        settings.value = { ...defaultSettings, ...parsed }
      }
    } catch (err) {
      console.warn('Failed to load settings:', err)
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem('nanke:settings', JSON.stringify(settings.value))
    } catch (err) {
      console.warn('Failed to save settings:', err)
    }
  }

  function updateSettings(partial: Partial<AppSettings>) {
    settings.value = { ...settings.value, ...partial }
    saveSettings()
    if (partial.theme) {
      applyTheme()
    }
  }

  function applyTheme() {
    const root = document.documentElement
    const theme = currentTheme.value
    
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    root.style.colorScheme = theme
  }

  function toggleSidebar() {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
  }

  function toggleRightPanel() {
    isRightPanelCollapsed.value = !isRightPanelCollapsed.value
  }

  function setActivePanel(panel: string) {
    activePanel.value = panel
  }

  function setSidebarWidth(width: number) {
    settings.value.sidebarWidth = Math.max(200, Math.min(500, width))
    saveSettings()
  }

  function setRightPanelWidth(width: number) {
    settings.value.rightPanelWidth = Math.max(200, Math.min(500, width))
    saveSettings()
  }

  return {
    // State
    isInitialized,
    isLoading,
    error,
    settings,
    activePanel,
    isSidebarCollapsed,
    isRightPanelCollapsed,

    // Getters
    currentTheme,
    isDark,
    effectiveSidebarWidth,
    effectiveRightPanelWidth,

    // Actions
    initialize,
    loadSettings,
    saveSettings,
    updateSettings,
    applyTheme,
    toggleSidebar,
    toggleRightPanel,
    setActivePanel,
    setSidebarWidth,
    setRightPanelWidth,
  }
})
