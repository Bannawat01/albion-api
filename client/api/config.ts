// API configuration for client-server communication
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:8800";
export const API_PREFIX = "/api";

export const createApiUrl = (endpoint: string) => {
  const baseUrl = API_BASE_URL.replace(/\/$/, "");
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${baseUrl}${API_PREFIX}${path}`;
};

// Common fetch wrapper with error handling
export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(createApiUrl(endpoint), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // For development
    });

    if (!response.ok) {
      const error = await response.text().catch(() => "Unknown error");
      throw new Error(`API Error ${response.status}: ${error}`);
    }

    return response.json();
  },
};