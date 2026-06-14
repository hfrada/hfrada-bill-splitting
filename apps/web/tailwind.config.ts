import type { Config } from 'tailwindcss'
import preset from '@bill/ui/tailwind-preset'

const config: Config = {
  presets: [preset],
  content: [
    './src/**/*.{ts,tsx,mdx}',
    // Scan the workspace UI packages so their utility classes are generated.
    '../../packages/ui/src/**/*.{ts,tsx}',
    '../../packages/purbio-react-ui/src/lib/**/*.{ts,tsx}',
  ],
}

export default config
