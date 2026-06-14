import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// purbio-react-ui's source uses the internal `@lib/*` path alias; map it so
// webpack can resolve those imports when we transpile the package source.
const purbioLib = path.resolve(__dirname, '../../packages/purbio-react-ui/src/lib')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Both packages ship raw TS/TSX source (no build step) — let Next compile them.
  transpilePackages: ['@bill/core', '@bill/ui', 'purbio-react-ui'],
  webpack: (config) => {
    config.resolve.alias['@lib'] = purbioLib
    return config
  },
}

export default nextConfig
