// vite.config.ts
import { defineConfig } from "file:///C:/Users/USER/Desktop/project%20GOM/no-ham-site-builder/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/USER/Desktop/project%20GOM/no-ham-site-builder/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/USER/Desktop/project%20GOM/no-ham-site-builder/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\USER\\Desktop\\project GOM\\no-ham-site-builder";
var vite_config_default = defineConfig(({ mode, command }) => ({
  base: "/",
  server: {
    host: "0.0.0.0",
    port: 8084,
    strictPort: true,
    cors: true,
    // Allow all hosts in development
    allowedHosts: [
      "localhost",
      ".ngrok-free.app",
      ".ngrok.io",
      "127.0.0.1"
    ],
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
      "Cross-Origin-Embedder-Policy": "credentialless",
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      "Access-Control-Allow-Credentials": "true"
    },
    proxy: {
      // Proxy API requests to avoid CORS issues
      "/api": {
        target: "http://localhost:8084",
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("proxy error", err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("Sending Request to the Target:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log("Received Response from the Target:", proxyRes.statusCode, req.url);
          });
        }
      }
    },
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 8084,
      clientPort: 443,
      path: "/ws"
    }
  },
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src"),
      // Fix for Three.js compatibility issues
      "three/examples/js/libs/stats.min": "three/examples/jsm/libs/stats.module.js",
      // Fix for renamed Three.js exports
      "CylinderBufferGeometry": "CylinderGeometry",
      "PlaneBufferGeometry": "PlaneGeometry",
      "BoxBufferGeometry": "BoxGeometry",
      "SphereBufferGeometry": "SphereGeometry",
      "RingBufferGeometry": "RingGeometry",
      "TorusBufferGeometry": "TorusGeometry",
      "TorusKnotBufferGeometry": "TorusKnotGeometry",
      "OctahedronBufferGeometry": "OctahedronGeometry",
      "TetrahedronBufferGeometry": "TetrahedronGeometry",
      "IcosahedronBufferGeometry": "IcosahedronGeometry",
      "DodecahedronBufferGeometry": "DodecahedronGeometry",
      "WebGLMultisampleRenderTarget": "WebGLRenderTarget",
      "RGBFormat": "RGBAFormat",
      "sRGBEncoding": "SRGBColorSpace",
      "LinearEncoding": "LinearSRGBColorSpace",
      "GammaEncoding": "SRGBColorSpace",
      "RGBEEncoding": "RGBEEncoding",
      "LogLuvEncoding": "LogLuvEncoding",
      "RGBM7Encoding": "RGBM7Encoding",
      "RGBM16Encoding": "RGBM16Encoding",
      "RGBDEncoding": "RGBDEncoding",
      "BasicDepthPacking": "BasicDepthPacking",
      "RGBADepthPacking": "RGBADepthPacking"
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
          r3f: ["@react-three/fiber"],
          xr: ["@react-three/xr"],
          drei: ["@react-three/drei"]
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      "three",
      "@react-three/fiber",
      "@react-three/xr",
      "@react-three/drei"
    ],
    exclude: ["@react-three/xr/core"],
    // Fixes common import issues
    esbuildOptions: {
      // Handle Three.js module resolution
      resolveExtensions: [".js", ".ts", ".jsx", ".tsx"],
      alias: {
        "three/examples/js/libs/stats.min": "three/examples/jsm/libs/stats.module.js",
        "CylinderBufferGeometry": "CylinderGeometry",
        "PlaneBufferGeometry": "PlaneGeometry",
        "BoxBufferGeometry": "BoxGeometry",
        "SphereBufferGeometry": "SphereGeometry",
        "RingBufferGeometry": "RingGeometry",
        "TorusBufferGeometry": "TorusGeometry",
        "TorusKnotBufferGeometry": "TorusKnotGeometry",
        "OctahedronBufferGeometry": "OctahedronGeometry",
        "TetrahedronBufferGeometry": "TetrahedronGeometry",
        "IcosahedronBufferGeometry": "IcosahedronGeometry",
        "DodecahedronBufferGeometry": "DodecahedronGeometry",
        "WebGLMultisampleRenderTarget": "WebGLRenderTarget",
        "RGBFormat": "RGBAFormat",
        "sRGBEncoding": "SRGBColorSpace",
        "LinearEncoding": "LinearSRGBColorSpace",
        "GammaEncoding": "SRGBColorSpace",
        "RGBEEncoding": "RGBEEncoding",
        "LogLuvEncoding": "LogLuvEncoding",
        "RGBM7Encoding": "RGBM7Encoding",
        "RGBM16Encoding": "RGBM16Encoding",
        "RGBDEncoding": "RGBDEncoding",
        "BasicDepthPacking": "BasicDepthPacking",
        "RGBADepthPacking": "RGBADepthPacking"
      }
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxVU0VSXFxcXERlc2t0b3BcXFxccHJvamVjdCBHT01cXFxcbm8taGFtLXNpdGUtYnVpbGRlclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcVVNFUlxcXFxEZXNrdG9wXFxcXHByb2plY3QgR09NXFxcXG5vLWhhbS1zaXRlLWJ1aWxkZXJcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL1VTRVIvRGVza3RvcC9wcm9qZWN0JTIwR09NL25vLWhhbS1zaXRlLWJ1aWxkZXIvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlLCBjb21tYW5kIH0pID0+ICh7XHJcbiAgYmFzZTogJy8nLFxyXG4gIHNlcnZlcjoge1xyXG4gICAgaG9zdDogXCIwLjAuMC4wXCIsXHJcbiAgICBwb3J0OiA4MDg0LFxyXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSxcclxuICAgIGNvcnM6IHRydWUsXHJcbiAgICAvLyBBbGxvdyBhbGwgaG9zdHMgaW4gZGV2ZWxvcG1lbnRcclxuICAgIGFsbG93ZWRIb3N0czogW1xyXG4gICAgICAnbG9jYWxob3N0JyxcclxuICAgICAgJy5uZ3Jvay1mcmVlLmFwcCcsXHJcbiAgICAgICcubmdyb2suaW8nLFxyXG4gICAgICAnMTI3LjAuMC4xJ1xyXG4gICAgXSxcclxuICAgIGhlYWRlcnM6IHtcclxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyxcclxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiAnR0VULCBQT1NULCBQVVQsIERFTEVURSwgUEFUQ0gsIE9QVElPTlMnLFxyXG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6ICdYLVJlcXVlc3RlZC1XaXRoLCBjb250ZW50LXR5cGUsIEF1dGhvcml6YXRpb24nLFxyXG4gICAgICAnQ3Jvc3MtT3JpZ2luLUVtYmVkZGVyLVBvbGljeSc6ICdjcmVkZW50aWFsbGVzcycsXHJcbiAgICAgICdDcm9zcy1PcmlnaW4tT3BlbmVyLVBvbGljeSc6ICdzYW1lLW9yaWdpbi1hbGxvdy1wb3B1cHMnLFxyXG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHMnOiAndHJ1ZSdcclxuICAgIH0sXHJcbiAgICBwcm94eToge1xyXG4gICAgICAvLyBQcm94eSBBUEkgcmVxdWVzdHMgdG8gYXZvaWQgQ09SUyBpc3N1ZXNcclxuICAgICAgJy9hcGknOiB7XHJcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDo4MDg0JyxcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgc2VjdXJlOiBmYWxzZSxcclxuICAgICAgICB3czogdHJ1ZSxcclxuICAgICAgICBjb25maWd1cmU6IChwcm94eSwgX29wdGlvbnMpID0+IHtcclxuICAgICAgICAgIHByb3h5Lm9uKCdlcnJvcicsIChlcnIsIF9yZXEsIF9yZXMpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ3Byb3h5IGVycm9yJywgZXJyKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgcHJveHkub24oJ3Byb3h5UmVxJywgKHByb3h5UmVxLCByZXEsIF9yZXMpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1NlbmRpbmcgUmVxdWVzdCB0byB0aGUgVGFyZ2V0OicsIHJlcS5tZXRob2QsIHJlcS51cmwpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBwcm94eS5vbigncHJveHlSZXMnLCAocHJveHlSZXMsIHJlcSwgX3JlcykgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnUmVjZWl2ZWQgUmVzcG9uc2UgZnJvbSB0aGUgVGFyZ2V0OicsIHByb3h5UmVzLnN0YXR1c0NvZGUsIHJlcS51cmwpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgaG1yOiB7XHJcbiAgICAgIHByb3RvY29sOiAnd3MnLFxyXG4gICAgICBob3N0OiAnbG9jYWxob3N0JyxcclxuICAgICAgcG9ydDogODA4NCxcclxuICAgICAgY2xpZW50UG9ydDogNDQzLFxyXG4gICAgICBwYXRoOiAnL3dzJ1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVhY3QoKSxcclxuICAgIG1vZGUgPT09ICdkZXZlbG9wbWVudCcgJiZcclxuICAgIGNvbXBvbmVudFRhZ2dlcigpLFxyXG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxyXG4gICAgICAvLyBGaXggZm9yIFRocmVlLmpzIGNvbXBhdGliaWxpdHkgaXNzdWVzXHJcbiAgICAgICd0aHJlZS9leGFtcGxlcy9qcy9saWJzL3N0YXRzLm1pbic6ICd0aHJlZS9leGFtcGxlcy9qc20vbGlicy9zdGF0cy5tb2R1bGUuanMnLFxyXG4gICAgICAvLyBGaXggZm9yIHJlbmFtZWQgVGhyZWUuanMgZXhwb3J0c1xyXG4gICAgICAnQ3lsaW5kZXJCdWZmZXJHZW9tZXRyeSc6ICdDeWxpbmRlckdlb21ldHJ5JyxcclxuICAgICAgJ1BsYW5lQnVmZmVyR2VvbWV0cnknOiAnUGxhbmVHZW9tZXRyeScsXHJcbiAgICAgICdCb3hCdWZmZXJHZW9tZXRyeSc6ICdCb3hHZW9tZXRyeScsXHJcbiAgICAgICdTcGhlcmVCdWZmZXJHZW9tZXRyeSc6ICdTcGhlcmVHZW9tZXRyeScsXHJcbiAgICAgICdSaW5nQnVmZmVyR2VvbWV0cnknOiAnUmluZ0dlb21ldHJ5JyxcclxuICAgICAgJ1RvcnVzQnVmZmVyR2VvbWV0cnknOiAnVG9ydXNHZW9tZXRyeScsXHJcbiAgICAgICdUb3J1c0tub3RCdWZmZXJHZW9tZXRyeSc6ICdUb3J1c0tub3RHZW9tZXRyeScsXHJcbiAgICAgICdPY3RhaGVkcm9uQnVmZmVyR2VvbWV0cnknOiAnT2N0YWhlZHJvbkdlb21ldHJ5JyxcclxuICAgICAgJ1RldHJhaGVkcm9uQnVmZmVyR2VvbWV0cnknOiAnVGV0cmFoZWRyb25HZW9tZXRyeScsXHJcbiAgICAgICdJY29zYWhlZHJvbkJ1ZmZlckdlb21ldHJ5JzogJ0ljb3NhaGVkcm9uR2VvbWV0cnknLFxyXG4gICAgICAnRG9kZWNhaGVkcm9uQnVmZmVyR2VvbWV0cnknOiAnRG9kZWNhaGVkcm9uR2VvbWV0cnknLFxyXG4gICAgICAnV2ViR0xNdWx0aXNhbXBsZVJlbmRlclRhcmdldCc6ICdXZWJHTFJlbmRlclRhcmdldCcsXHJcbiAgICAgICdSR0JGb3JtYXQnOiAnUkdCQUZvcm1hdCcsXHJcbiAgICAgICdzUkdCRW5jb2RpbmcnOiAnU1JHQkNvbG9yU3BhY2UnLFxyXG4gICAgICAnTGluZWFyRW5jb2RpbmcnOiAnTGluZWFyU1JHQkNvbG9yU3BhY2UnLFxyXG4gICAgICAnR2FtbWFFbmNvZGluZyc6ICdTUkdCQ29sb3JTcGFjZScsXHJcbiAgICAgICdSR0JFRW5jb2RpbmcnOiAnUkdCRUVuY29kaW5nJyxcclxuICAgICAgJ0xvZ0x1dkVuY29kaW5nJzogJ0xvZ0x1dkVuY29kaW5nJyxcclxuICAgICAgJ1JHQk03RW5jb2RpbmcnOiAnUkdCTTdFbmNvZGluZycsXHJcbiAgICAgICdSR0JNMTZFbmNvZGluZyc6ICdSR0JNMTZFbmNvZGluZycsXHJcbiAgICAgICdSR0JERW5jb2RpbmcnOiAnUkdCREVuY29kaW5nJyxcclxuICAgICAgJ0Jhc2ljRGVwdGhQYWNraW5nJzogJ0Jhc2ljRGVwdGhQYWNraW5nJyxcclxuICAgICAgJ1JHQkFEZXB0aFBhY2tpbmcnOiAnUkdCQURlcHRoUGFja2luZydcclxuICAgIH0sXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICBtYW51YWxDaHVua3M6IHtcclxuICAgICAgICAgIHRocmVlOiBbJ3RocmVlJ10sXHJcbiAgICAgICAgICByM2Y6IFsnQHJlYWN0LXRocmVlL2ZpYmVyJ10sXHJcbiAgICAgICAgICB4cjogWydAcmVhY3QtdGhyZWUveHInXSxcclxuICAgICAgICAgIGRyZWk6IFsnQHJlYWN0LXRocmVlL2RyZWknXVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICBpbmNsdWRlOiBbXHJcbiAgICAgICd0aHJlZScsXHJcbiAgICAgICdAcmVhY3QtdGhyZWUvZmliZXInLFxyXG4gICAgICAnQHJlYWN0LXRocmVlL3hyJyxcclxuICAgICAgJ0ByZWFjdC10aHJlZS9kcmVpJ1xyXG4gICAgXSxcclxuICAgIGV4Y2x1ZGU6IFsnQHJlYWN0LXRocmVlL3hyL2NvcmUnXSwgLy8gRml4ZXMgY29tbW9uIGltcG9ydCBpc3N1ZXNcclxuICAgIGVzYnVpbGRPcHRpb25zOiB7XHJcbiAgICAgIC8vIEhhbmRsZSBUaHJlZS5qcyBtb2R1bGUgcmVzb2x1dGlvblxyXG4gICAgICByZXNvbHZlRXh0ZW5zaW9uczogWycuanMnLCAnLnRzJywgJy5qc3gnLCAnLnRzeCddLFxyXG4gICAgICBhbGlhczoge1xyXG4gICAgICAgICd0aHJlZS9leGFtcGxlcy9qcy9saWJzL3N0YXRzLm1pbic6ICd0aHJlZS9leGFtcGxlcy9qc20vbGlicy9zdGF0cy5tb2R1bGUuanMnLFxyXG4gICAgICAgICdDeWxpbmRlckJ1ZmZlckdlb21ldHJ5JzogJ0N5bGluZGVyR2VvbWV0cnknLFxyXG4gICAgICAgICdQbGFuZUJ1ZmZlckdlb21ldHJ5JzogJ1BsYW5lR2VvbWV0cnknLFxyXG4gICAgICAgICdCb3hCdWZmZXJHZW9tZXRyeSc6ICdCb3hHZW9tZXRyeScsXHJcbiAgICAgICAgJ1NwaGVyZUJ1ZmZlckdlb21ldHJ5JzogJ1NwaGVyZUdlb21ldHJ5JyxcclxuICAgICAgICAnUmluZ0J1ZmZlckdlb21ldHJ5JzogJ1JpbmdHZW9tZXRyeScsXHJcbiAgICAgICAgJ1RvcnVzQnVmZmVyR2VvbWV0cnknOiAnVG9ydXNHZW9tZXRyeScsXHJcbiAgICAgICAgJ1RvcnVzS25vdEJ1ZmZlckdlb21ldHJ5JzogJ1RvcnVzS25vdEdlb21ldHJ5JyxcclxuICAgICAgICAnT2N0YWhlZHJvbkJ1ZmZlckdlb21ldHJ5JzogJ09jdGFoZWRyb25HZW9tZXRyeScsXHJcbiAgICAgICAgJ1RldHJhaGVkcm9uQnVmZmVyR2VvbWV0cnknOiAnVGV0cmFoZWRyb25HZW9tZXRyeScsXHJcbiAgICAgICAgJ0ljb3NhaGVkcm9uQnVmZmVyR2VvbWV0cnknOiAnSWNvc2FoZWRyb25HZW9tZXRyeScsXHJcbiAgICAgICAgJ0RvZGVjYWhlZHJvbkJ1ZmZlckdlb21ldHJ5JzogJ0RvZGVjYWhlZHJvbkdlb21ldHJ5JyxcclxuICAgICAgICAnV2ViR0xNdWx0aXNhbXBsZVJlbmRlclRhcmdldCc6ICdXZWJHTFJlbmRlclRhcmdldCcsXHJcbiAgICAgICAgJ1JHQkZvcm1hdCc6ICdSR0JBRm9ybWF0JyxcclxuICAgICAgICAnc1JHQkVuY29kaW5nJzogJ1NSR0JDb2xvclNwYWNlJyxcclxuICAgICAgICAnTGluZWFyRW5jb2RpbmcnOiAnTGluZWFyU1JHQkNvbG9yU3BhY2UnLFxyXG4gICAgICAgICdHYW1tYUVuY29kaW5nJzogJ1NSR0JDb2xvclNwYWNlJyxcclxuICAgICAgICAnUkdCRUVuY29kaW5nJzogJ1JHQkVFbmNvZGluZycsXHJcbiAgICAgICAgJ0xvZ0x1dkVuY29kaW5nJzogJ0xvZ0x1dkVuY29kaW5nJyxcclxuICAgICAgICAnUkdCTTdFbmNvZGluZyc6ICdSR0JNN0VuY29kaW5nJyxcclxuICAgICAgICAnUkdCTTE2RW5jb2RpbmcnOiAnUkdCTTE2RW5jb2RpbmcnLFxyXG4gICAgICAgICdSR0JERW5jb2RpbmcnOiAnUkdCREVuY29kaW5nJyxcclxuICAgICAgICAnQmFzaWNEZXB0aFBhY2tpbmcnOiAnQmFzaWNEZXB0aFBhY2tpbmcnLFxyXG4gICAgICAgICdSR0JBRGVwdGhQYWNraW5nJzogJ1JHQkFEZXB0aFBhY2tpbmcnXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn0pKTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUErVixTQUFTLG9CQUFvQjtBQUM1WCxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsdUJBQXVCO0FBSGhDLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsTUFBTSxRQUFRLE9BQU87QUFBQSxFQUNsRCxNQUFNO0FBQUEsRUFDTixRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsSUFDWixNQUFNO0FBQUE7QUFBQSxJQUVOLGNBQWM7QUFBQSxNQUNaO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsK0JBQStCO0FBQUEsTUFDL0IsZ0NBQWdDO0FBQUEsTUFDaEMsZ0NBQWdDO0FBQUEsTUFDaEMsZ0NBQWdDO0FBQUEsTUFDaEMsOEJBQThCO0FBQUEsTUFDOUIsb0NBQW9DO0FBQUEsSUFDdEM7QUFBQSxJ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
