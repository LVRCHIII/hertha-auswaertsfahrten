import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type ThemeId = 'klassisch' | 'aufwaerm' | 'auswaerts2021' | 'auswaerts2425' | 'schwarzerbeton'

export type ThemeOption = {
  id: ThemeId
  label: string
  previewBg: string
  previewFg: string
}

export const THEMES: ThemeOption[] = [
  { id: 'klassisch',       label: 'Klassisch',       previewBg: '#003264', previewFg: '#ffffff' },
  { id: 'aufwaerm',        label: 'Aufwärm Shirt',   previewBg: '#0d1c25', previewFg: '#6dcfe4' },
  { id: 'auswaerts2021',   label: 'Auswärts 20/21',  previewBg: '#050c18', previewFg: '#4d72ff' },
  { id: 'auswaerts2425',   label: 'Auswärts 24/25',  previewBg: '#0f1215', previewFg: '#c8d8f0' },
  { id: 'schwarzerbeton',  label: 'Schwarzer Beton', previewBg: '#0d0d0d', previewFg: '#ebebeb' },
]

type ThemeContextValue = {
  theme: ThemeId
  setTheme: (id: ThemeId) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'klassisch',
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    return (localStorage.getItem('hertha-theme') as ThemeId) ?? 'klassisch'
  })

  useEffect(() => {
    const root = document.documentElement
    THEMES.forEach(t => root.classList.remove(`theme-${t.id}`))
    if (theme !== 'klassisch') {
      root.classList.add(`theme-${theme}`)
    }
    localStorage.setItem('hertha-theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
