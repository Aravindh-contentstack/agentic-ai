import Contentstack from "contentstack";
import { agentDebugLog } from "@/lib/debug-agent-log";

const REQUIRED = [
  "CONTENTSTACK_API_KEY",
  "CONTENTSTACK_DELIVERY_TOKEN",
  "CONTENTSTACK_ENVIRONMENT",
];

function requireEnv(name) {
  const value = process.env[name];
  if (value === undefined || String(value).trim() === "") {
    throw new Error(
      `Missing required environment variable: ${name}. Set it in .env.local (copy from Contentstack: API key, Delivery token, environment name).`,
    );
  }
  return String(value).trim();
}

function getStack() {
  for (const key of REQUIRED) {
    requireEnv(key);
  }
  return Contentstack.Stack({
    api_key: process.env.CONTENTSTACK_API_KEY,
    delivery_token: process.env.CONTENTSTACK_DELIVERY_TOKEN,
    environment: process.env.CONTENTSTACK_ENVIRONMENT,
  });
}

/**
 * UID of the Contentstack content type used for the marketing home and service list/detail.
 * Override when your stack uses a different UID than the default `home_page`.
 * @returns {string}
 */
export function homePageContentTypeUid() {
  const raw = process.env.CONTENTSTACK_HOME_CONTENT_TYPE_UID;
  return raw != null && String(raw).trim() !== ""
    ? String(raw).trim()
    : "home_page";
}

/**
 * @param {string} contentTypeUid
 * @returns {Promise<object[]>}
 */
export async function getEntries(contentTypeUid) {
  // #region agent log
  agentDebugLog({
    hypothesisId: "H1",
    location: "lib/contentstack.js:getEntries:pre",
    message: "getEntries start",
    data: {
      contentTypeUid,
      environment: process.env.CONTENTSTACK_ENVIRONMENT ?? null,
    },
  });
  // #endregion
  const stack = getStack();
  try {
    const result = await stack
      .ContentType(contentTypeUid)
      .Query()
      .limit(250)
      .toJSON()
      .find();
    const entries = Array.isArray(result) ? result[0] : null;
    const list = Array.isArray(entries) ? entries : [];
    // #region agent log
    agentDebugLog({
      hypothesisId: "H1",
      location: "lib/contentstack.js:getEntries:ok",
      message: "getEntries success",
      data: { contentTypeUid, count: list.length },
    });
    // #endregion
    return list;
  } catch (err) {
    const msg =
      err && typeof err === "object" && "message" in err
        ? String(err.message)
        : String(err);
    // #region agent log
    agentDebugLog({
      hypothesisId: "H1",
      location: "lib/contentstack.js:getEntries:err",
      message: "getEntries failed",
      data: { contentTypeUid, errorMessage: msg },
    });
    // #endregion
    throw err;
  }
}

/**
 * Blog posts sorted by published_date (newest first).
 * @returns {Promise<object[]>}
 */
export async function getBlogPosts() {
  const stack = getStack();
  const result = await stack
    .ContentType("blog_post")
    .Query()
    .descending("published_date")
    .limit(250)
    .toJSON()
    .find();
  const entries = Array.isArray(result) ? result[0] : null;
  return Array.isArray(entries) ? entries : [];
}

export const BLOG_INDEX_PAGE_SIZE = 9;

/**
 * One page of blog_post entries (newest first) with total count for pagination.
 * @param {number} page 1-based page index
 * @returns {Promise<{ entries: object[], total: number }>}
 */
export async function getBlogPostsPage(page) {
  const n = Number(page);
  const safePage =
    Number.isFinite(n) && Number.isInteger(n) && n >= 1 ? n : 1;
  const skip = (safePage - 1) * BLOG_INDEX_PAGE_SIZE;

  const stack = getStack();
  const result = await stack
    .ContentType("blog_post")
    .Query()
    .descending("published_date")
    .limit(BLOG_INDEX_PAGE_SIZE)
    .skip(skip)
    .includeCount()
    .toJSON()
    .find();

  const entries = Array.isArray(result) ? result[0] : null;
  const list = Array.isArray(entries) ? entries : [];

  let total = list.length;
  if (Array.isArray(result)) {
    for (let i = result.length - 1; i >= 1; i--) {
      const x = result[i];
      if (typeof x === "number" && Number.isFinite(x)) {
        total = x;
        break;
      }
    }
  }

  return { entries: list, total };
}

function escapeRegexLiteral(fragment) {
  return String(fragment).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Case-insensitive substring search on title OR body (blog_post).
 * @param {string} rawQuery
 * @returns {Promise<object[]>}
 */
export async function searchBlogPosts(rawQuery) {
  const q = String(rawQuery ?? "").trim();
  if (!q) return [];

  const stack = getStack();
  const pattern = escapeRegexLiteral(q);
  const titleQuery = stack
    .ContentType("blog_post")
    .Query()
    .regex("title", pattern, "i")
    .getQuery();
  const bodyQuery = stack
    .ContentType("blog_post")
    .Query()
    .regex("body", pattern, "i")
    .getQuery();

  const result = await stack
    .ContentType("blog_post")
    .Query()
    .or(titleQuery, bodyQuery)
    .descending("published_date")
    .limit(250)
    .toJSON()
    .find();
  const entries = Array.isArray(result) ? result[0] : null;
  return Array.isArray(entries) ? entries : [];
}

/**
 * @param {string} slug
 * @returns {Promise<object|null>}
 */
export async function getHomePage(slug) {
  try {
    const stack = getStack();
    const result = await stack
      .ContentType(homePageContentTypeUid())
      .Query()
      .where("slug", slug)
      .limit(1)
      .toJSON()
      .find();
    const entries = Array.isArray(result) ? result[0] : null;
    if (!Array.isArray(entries) || entries.length === 0) return null;
    return entries[0];
  } catch (err) {
    const msg =
      err && typeof err === "object" && "message" in err
        ? String(err.message)
        : String(err);
    // #region agent log
    agentDebugLog({
      hypothesisId: "H1",
      location: "lib/contentstack.js:getHomePage:err",
      message: "getHomePage failed",
      data: { errorMessage: msg },
    });
    // #endregion
    return null;
  }
}

/**
 * @param {string} slug
 * @returns {Promise<object|null>}
 */
export async function getBlogPost(slug) {
  const stack = getStack();
  const result = await stack
    .ContentType("blog_post")
    .Query()
    .where("slug", slug)
    .limit(1)
    .toJSON()
    .find();
  const entries = Array.isArray(result) ? result[0] : null;
  if (!Array.isArray(entries) || entries.length === 0) return null;
  return entries[0];
}
