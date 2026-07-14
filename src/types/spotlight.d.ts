declare module 'spotlight.js/src/js/spotlight.js' {
  export type SpotlightSlide = {
    src: string
    title?: string | false
    description?: string | false
    download?: boolean
  }

  export type SpotlightOptions = {
    index?: number
    class?: string
    animation?: string | string[]
    control?: string | string[]
    autohide?: boolean | number | string
    infinite?: boolean
    preload?: boolean
    onshow?: (index?: number) => void
    onchange?: (index: number, options: Record<string, unknown>) => void
    onclose?: () => void
  }

  type SpotlightApi = {
    show: (
      gallery: SpotlightSlide[],
      options?: SpotlightOptions,
      index?: number,
    ) => void
    close: () => void
    next: () => void
    prev: () => void
    goto: (index: number) => void
    zoom: (value?: number) => void
    fullscreen: (enabled?: boolean) => void
  }

  const Spotlight: SpotlightApi
  export default Spotlight
}
