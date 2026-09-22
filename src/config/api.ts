/**
 * External Backend API Configuration & Connection Helper
 * Respects VITE_API_URL and provides runtime fallback/override for Vercel SPA deployments.
 */

const STORAGE_KEY_CUSTOM_API_URL = "cherry_admin_custom_api_url";

export function getDefaultApiUrl(): string {
  return (import.meta.env.VITE_API_URL as string) || "";
}

export function getBackendApiUrl(): string {
  try {
    const custom = localStorage.getItem(STORAGE_KEY_CUSTOM_API_URL);
    if (custom && custom.trim()) {
      return custom.trim().replace(/\/+$/, "");
    }
  } catch {
    // Ignore localStorage access issues
  }
  return getDefaultApiUrl().trim().replace(/\/+$/, "");
}

export function setCustomBackendApiUrl(url: string | null): void {
  try {
    if (!url || !url.trim()) {
      localStorage.removeItem(STORAGE_KEY_CUSTOM_API_URL);
    } else {
      localStorage.setItem(STORAGE_KEY_CUSTOM_API_URL, url.trim().replace(/\/+$/, ""));
    }
    window.dispatchEvent(new Event("cherry_backend_api_url_changed"));
  } catch (e) {
    console.error("Failed to persist custom API URL", e);
  }
}

export interface BackendHealthStatus {
  connected: boolean;
  statusText: string;
  statusCode?: number;
  url: string;
  latencyMs?: number;
  data?: any;
}

export async function checkBackendHealth(timeoutMs = 5000): Promise<BackendHealthStatus> {
  const baseUrl = getBackendApiUrl();
  if (!baseUrl) {
    return {
      connected: false,
      statusText: "No VITE_API_URL configured (using Firestore & Local Storage mode)",
      url: "Not configured",
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const startTime = performance.now();

  try {
    // Attempt standard health routes (/api/health or /health)
    const testEndpoints = [`${baseUrl}/api/health`, `${baseUrl}/health`, baseUrl];
    let lastError: any = null;

    for (const endpoint of testEndpoints) {
      try {
        const response = await fetch(endpoint, {
          method: "GET",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const latencyMs = Math.round(performance.now() - startTime);

        let data: any = null;
        try {
          data = await response.json();
        } catch {
          // Response may not be JSON
        }

        if (response.ok) {
          return {
            connected: true,
            statusText: `Online (HTTP ${response.status})`,
            statusCode: response.status,
            url: endpoint,
            latencyMs,
            data,
          };
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    clearTimeout(timeoutId);
    return {
      connected: false,
      statusText: lastError?.message || "Failed to connect to backend",
      url: baseUrl,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    return {
      connected: false,
      statusText: err?.message || "Network error",
      url: baseUrl,
    };
  }
}
