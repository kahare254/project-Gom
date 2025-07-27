import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8084,
    strictPort: true,
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "192.168.100.12",
      ".ngrok-free.app",
      ".ngrok.io"
    ],
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 8084
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Fix for Three.js compatibility issues
      'three/examples/js/libs/stats.min': 'three/examples/jsm/libs/stats.module.js',
      // Fix for renamed Three.js exports
      'CylinderBufferGeometry': 'CylinderGeometry',
      'PlaneBufferGeometry': 'PlaneGeometry',
      'BoxBufferGeometry': 'BoxGeometry',
      'SphereBufferGeometry': 'SphereGeometry',
      'RingBufferGeometry': 'RingGeometry',
      'TorusBufferGeometry': 'TorusGeometry',
      'TorusKnotBufferGeometry': 'TorusKnotGeometry',
      'OctahedronBufferGeometry': 'OctahedronGeometry',
      'TetrahedronBufferGeometry': 'TetrahedronGeometry',
      'IcosahedronBufferGeometry': 'IcosahedronGeometry',
      'DodecahedronBufferGeometry': 'DodecahedronGeometry',
      'WebGLMultisampleRenderTarget': 'WebGLRenderTarget',
      'RGBFormat': 'RGBAFormat',
      'sRGBEncoding': 'SRGBColorSpace',
      'LinearEncoding': 'LinearSRGBColorSpace',
      'GammaEncoding': 'SRGBColorSpace',
      'RGBEEncoding': 'RGBEEncoding',
      'LogLuvEncoding': 'LogLuvEncoding',
      'RGBM7Encoding': 'RGBM7Encoding',
      'RGBM16Encoding': 'RGBM16Encoding',
      'RGBDEncoding': 'RGBDEncoding',
      'BasicDepthPacking': 'BasicDepthPacking',
      'RGBADepthPacking': 'RGBADepthPacking'
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber'],
          xr: ['@react-three/xr'],
          drei: ['@react-three/drei']
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      'three',
      '@react-three/fiber',
      '@react-three/xr',
      '@react-three/drei'
    ],
    exclude: ['@react-three/xr/core'], // Fixes common import issues
    esbuildOptions: {
      // Handle Three.js module resolution
      resolveExtensions: ['.js', '.ts', '.jsx', '.tsx'],
      alias: {
        'three/examples/js/libs/stats.min': 'three/examples/jsm/libs/stats.module.js',
        'CylinderBufferGeometry': 'CylinderGeometry',
        'PlaneBufferGeometry': 'PlaneGeometry',
        'BoxBufferGeometry': 'BoxGeometry',
        'SphereBufferGeometry': 'SphereGeometry',
        'RingBufferGeometry': 'RingGeometry',
        'TorusBufferGeometry': 'TorusGeometry',
        'TorusKnotBufferGeometry': 'TorusKnotGeometry',
        'OctahedronBufferGeometry': 'OctahedronGeometry',
        'TetrahedronBufferGeometry': 'TetrahedronGeometry',
        'IcosahedronBufferGeometry': 'IcosahedronGeometry',
        'DodecahedronBufferGeometry': 'DodecahedronGeometry',
        'WebGLMultisampleRenderTarget': 'WebGLRenderTarget',
        'RGBFormat': 'RGBAFormat',
        'sRGBEncoding': 'SRGBColorSpace',
        'LinearEncoding': 'LinearSRGBColorSpace',
        'GammaEncoding': 'SRGBColorSpace',
        'RGBEEncoding': 'RGBEEncoding',
        'LogLuvEncoding': 'LogLuvEncoding',
        'RGBM7Encoding': 'RGBM7Encoding',
        'RGBM16Encoding': 'RGBM16Encoding',
        'RGBDEncoding': 'RGBDEncoding',
        'BasicDepthPacking': 'BasicDepthPacking',
        'RGBADepthPacking': 'RGBADepthPacking'
      }
    }
  }
}));
