export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://my-ai-chatbot-2-o2pz.onrender.com";

export function getApiUrl(path) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${API_BASE_URL.replace(/\/$/, "")}${cleanPath}`;
}