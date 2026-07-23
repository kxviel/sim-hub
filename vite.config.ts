import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const host = process.env.TAURI_DEV_HOST;
const middleware_uri = process.env.NGROK_BASE_URI;

export default defineConfig(async () => ({
	plugins: [
		tanstackRouter({
			target: "react",
			autoCodeSplitting: true,
		}),
		react(),
		tailwindcss(),
	],
	resolve: {
		tsconfigPaths: true,
	},

	// Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
	// 1. prevent Vite from obscuring rust errors
	clearScreen: false,
	// 2. tauri expects a fixed port, fail if that port is not available
	server: {
		port: 1420,
		strictPort: true,
		host: host || false,
		hmr: host
			? {
					protocol: "ws",
					host,
					port: 1421,
				}
			: undefined,
		watch: {
			// 3. tell Vite to ignore watching `src-tauri`
			ignored: ["**/src-tauri/**"],
		},

		// 4. Frontend API Calls
		proxy: {
			"/middleware": {
				target: middleware_uri,
				changeOrigin: true,
				headers: {
					"ngrok-skip-browser-warning": "true",
				},
				rewrite: (path: string) => path.replace(/^\/middleware/, ""),
			},
		},
	},
}));
