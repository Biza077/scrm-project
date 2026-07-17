export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("scrm_token") : null;
  
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Ensure content-type is application/json if not explicitly set and body exists
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, { ...options, headers, cache: "no-store" });
  
  if (response.status === 401) {
    // Unauthorized: token might be expired. Handle logout gracefully.
    if (typeof window !== "undefined") {
      localStorage.removeItem("scrm_token");
      localStorage.removeItem("scrm_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
  }
  
  return response;
}
