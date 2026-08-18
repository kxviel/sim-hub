import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const API_TARGET_QUERY_PARAM = "__middle_logic_target";

const getMiddlewareTarget = (request: { url?: string }) => {
	const requestUrl = new URL(request.url ?? "", "http://localhost");
	const target =
		requestUrl.searchParams.get(API_TARGET_QUERY_PARAM)?.trim() ?? "";

	return /^https?:\/\//i.test(target) ? target.replace(/\/+$/, "") : undefined;
};

const rewriteMiddlewarePath = (path: string) => {
	const url = new URL(path, "http://localhost");
	url.pathname = url.pathname.replace(/^\/middleware/, "");
	return `${url.pathname}${url.search}`;
};

const removeMiddlewareTarget = (request: { url?: string }) => {
	const url = new URL(request.url ?? "", "http://localhost");
	url.searchParams.delete(API_TARGET_QUERY_PARAM);
	request.url = `${url.pathname}${url.search}`;
};

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");

	const host = env.TAURI_DEV_HOST;
	const middlewareUri = env.NGROK_BASE_URI;

	if (!middlewareUri) {
		throw new Error("NGROK_BASE_URI is missing from the Vite environment.");
	}

	return {
		define: {
			__TAURI_MIDDLE_LOGIC_URI__: JSON.stringify(middlewareUri),
		},
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
					configure: (proxy) => {
						const proxyWeb = proxy.web.bind(proxy);

						proxy.web = (request, response, options) => {
							const target = getMiddlewareTarget(request) ?? middlewareUri;
							removeMiddlewareTarget(request);
							return proxyWeb(request, response, { ...options, target });
						};
					},
					headers: {
						"ngrok-skip-browser-warning": "true",
					},
					rewrite: rewriteMiddlewarePath,
				},
			},
		},
	};
});
