/**
 * Build header nav items from Contentstack `navigation_item` entries.
 * Handles alternate field UIDs, link objects, common path mistakes, and duplicates.
 */

function asTrimmedString(v) {
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  return "";
}

function pickLabel(entry) {
  const raw =
    entry.label ?? entry.title ?? entry.name ?? entry.navigation_label;
  let s = asTrimmedString(raw);
  if (s.startsWith("[Navigation Items] - ")) {
    s = s.slice("[Navigation Items] - ".length).trim();
  }
  return s;
}

function pickLinkRaw(entry) {
  const raw = entry.link ?? entry.url ?? entry.href ?? entry.path;
  if (raw == null) return "";
  if (typeof raw === "string") return raw.trim();
  if (typeof raw === "object") {
    const nested = raw.href ?? raw.url ?? raw.link;
    return asTrimmedString(nested);
  }
  return "";
}

/**
 * @param {string} href
 * @param {string | undefined} siteUrl NEXT_PUBLIC_SITE_URL — used to treat same-host absolute URLs as internal paths
 * @returns {string}
 */
export function normalizeNavHref(href, siteUrl) {
  let h = String(href).trim();
  if (!h) return "";

  if (/^https?:\/\//i.test(h)) {
    try {
      const u = new URL(h);
      const isLocal =
        u.hostname === "localhost" || u.hostname === "127.0.0.1";
      let sameSite = false;
      const envBase = siteUrl != null ? String(siteUrl).trim() : "";
      if (envBase) {
        try {
          const base = new URL(envBase);
          sameSite =
            base.hostname === u.hostname && base.port === u.port;
        } catch {
          /* ignore invalid env */
        }
      }
      if (isLocal || sameSite) {
        h = `${u.pathname}${u.search}${u.hash}`;
      } else {
        return h;
      }
    } catch {
      return h;
    }
  }

  if (!h.startsWith("/")) {
    h = `/${h}`;
  }

  h = h.replace(/\/{2,}/g, "/");

  let pathOnly = h.split("#")[0].split("?")[0];
  const lower = pathOnly.toLowerCase();
  if (lower === "/home" || lower === "/index") {
    pathOnly = "/";
  }

  const noTrail =
    pathOnly.length > 1 ? pathOnly.replace(/\/+$/, "") : pathOnly;
  return noTrail === "" ? "/" : noTrail;
}

/**
 * @param {object[]} entries raw Contentstack entries
 * @returns {{ uid?: string, label: string, link: string }[]}
 */
export function normalizeNavigationEntries(entries) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const sorted = [...entries].sort(
    (a, b) => (Number(a.order) || 0) - (Number(b.order) || 0),
  );
  const seen = new Set();
  const items = [];
  for (const entry of sorted) {
    const label = pickLabel(entry);
    const link = normalizeNavHref(pickLinkRaw(entry), siteUrl);
    if (!label || !link) continue;
    const dedupeKey = link.toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    items.push({
      uid: entry.uid,
      label,
      link,
    });
  }
  return items;
}
