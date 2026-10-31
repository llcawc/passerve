import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/passerve.ts'],
  outDir: './bin',
  format: {
    esm: {
      fixedExtension: false,
      target: ['esnext'],
    },
  },
  dts: false,
  exports: false,
})
