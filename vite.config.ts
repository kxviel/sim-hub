import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");

	const host = env.TAURI_DEV_HOST;
	const middlewareUri = env.NGROK_BASE_URI;

	if (!middlewareUri) {
		throw new Error("NGROK_BASE_URI is missing from the Vite environment.");
	}

	return {
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
					target: middlewareUri,
					changeOrigin: true,
					headers: {
						"ngrok-skip-browser-warning": "true",
					},
					rewrite: (path: string) => path.replace(/^\/middleware/, ""),
				},
			},
		},
	};
});
