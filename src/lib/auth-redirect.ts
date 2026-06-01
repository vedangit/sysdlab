export function getAuthRedirectUrl() {
  if (typeof window === "undefined") {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL?.trim();
    return ensureAbsoluteUrl(siteUrl ?? vercelUrl ?? "http://localhost:3000");
  }

  const currentOrigin = window.location.origin;

  const url = new URL(window.location.pathname + window.location.search, currentOrigin);
  return url.toString();
}

function ensureAbsoluteUrl(url: string) {
  const normalized = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
  return normalized.endsWith("/") ? normalized : `${normalized}/`;
}
