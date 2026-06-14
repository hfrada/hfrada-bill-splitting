'use client'

// purbio-react-ui targets CSR and ships no per-file "use client" directives, so
// this barrel is the single client boundary: everything re-exported here (and
// its transitive imports) lands in the client graph. Server Components can still
// import and render these components as client components.

// Re-export the full purbio-react-ui surface (components, ThemeProvider,
// useTheme, presets, cn, types, …) so the app imports everything from `@bill/ui`.
export * from 'purbio-react-ui'

// App-specific theming layer.
export { AppThemeProvider, billTheme, billConfig } from './theme'
export type { AppThemeProviderProps } from './theme'
