/**
 * Globales Textur-Overlay — wird aktiviert wenn das aktive Theme
 * die CSS-Variable --shell-texture-url setzt.
 * Position: fixed, z-index 0 (unter Header/Content, über Background-Farbe)
 *
 * CSS-Variablen:
 *   --shell-texture-url      Bild-URL (none = deaktiviert)
 *   --shell-texture-opacity  0–1
 *   --shell-texture-repeat   'no-repeat' (default, Cover-Bild) | 'repeat' (Seamless-Tile)
 *   --shell-texture-size     'cover' (default) | 'auto' (Tile-Größe beibehalten)
 */
export function TextureOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        backgroundImage: 'var(--shell-texture-url, none)',
        backgroundRepeat: 'var(--shell-texture-repeat, no-repeat)' as React.CSSProperties['backgroundRepeat'],
        backgroundSize: 'var(--shell-texture-size, cover)' as React.CSSProperties['backgroundSize'],
        backgroundPosition: 'center',
        opacity: 'var(--shell-texture-opacity, 0)' as React.CSSProperties['opacity'],
      }}
    />
  )
}
