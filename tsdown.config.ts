import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/server.ts'],
  format: {
    esm: {
      fixedExtension: false,
      target: ['esnext'],
    },
    cjs: {
      target: ['node16'],
    },
  },
  dts: {
    tsgo: true,
  },
  exports: true,
})
