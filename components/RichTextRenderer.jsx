import { jsonToHTML } from "@contentstack/utils";

const DEFAULT_CLASS =
  "prose prose-zinc max-w-none dark:prose-invert";

function setPath(obj, path, value) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (cur[p] == null || typeof cur[p] !== "object") {
      cur[p] = {};
    }
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

function cloneEntryBase(entry) {
  if (entry == null || typeof entry !== "object") {
    return {};
  }
  try {
    return structuredClone(entry);
  } catch {
    return { ...entry };
  }
}

function cloneRteJson(value) {
  try {
    return structuredClone(value);
  } catch {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return value;
    }
  }
}

/**
 * @param {object} props
 * @param {unknown} props.json — JSON RTE document or HTML string from CDA
 * @param {string} [props.path="body"] — field path for jsonToHTML
 * @param {object} [props.entry] — full CDA entry for embedded items (optional)
 * @param {string} [props.className]
 * @param {import("react").ReactNode} [props.fallback] — shown when there is no RTE HTML (e.g. excerpt)
 */
export default function RichTextRenderer({
  json,
  path = "body",
  entry,
  className = DEFAULT_CLASS,
  fallback = null,
}) {
  if (json == null || json === "") {
    return fallback;
  }

  if (typeof json === "string") {
    const html = json.trim();
    if (!html) return fallback;
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  if (typeof json !== "object") {
    return fallback;
  }

  const clone = cloneEntryBase(entry);
  setPath(clone, path, cloneRteJson(json));
  jsonToHTML({ entry: clone, paths: [path] });

  const atPath = path.split(".").reduce((o, key) => o?.[key], clone);
  const html =
    typeof atPath === "string" ? atPath.trim() : "";

  if (!html) {
    return fallback;
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
