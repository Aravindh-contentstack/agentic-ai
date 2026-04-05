/**
 * Normalize a Contentstack File / Asset field from the CDA (string URL or object).
 * @param {unknown} field
 * @returns {string|null}
 */
export function fileFieldUrl(field) {
  if (field == null || field === "") return null;
  if (typeof field === "string") {
    const s = field.trim();
    return s === "" ? null : s;
  }
  if (typeof field === "object") {
    const u = field.url ?? field.file?.url;
    if (u == null || u === "") return null;
    return String(u).trim() || null;
  }
  return null;
}

/**
 * Append Image Delivery query params (width, environment) for Contentstack CDN URLs.
 * @param {string|null|undefined} url
 * @param {{ width?: number }} [options]
 * @returns {string|null}
 */
export function contentstackImageSrc(url, options = {}) {
  if (url == null || String(url).trim() === "") return null;
  const raw = String(url).trim();
  const width = options.width;
  try {
    const u = new URL(raw);
    if (width != null && Number.isFinite(Number(width))) {
      u.searchParams.set("width", String(Math.round(Number(width))));
    }
    const env = process.env.CONTENTSTACK_ENVIRONMENT?.trim();
    if (env && !u.searchParams.has("environment")) {
      u.searchParams.set("environment", env);
    }
    return u.toString();
  } catch {
    return raw;
  }
}
