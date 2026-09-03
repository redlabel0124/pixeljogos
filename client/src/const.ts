import { GOOGLE_SITES_RETURN_URL, OAUTH_STATE_COOKIE, COOKIE_NAME, encodeOAuthState } from "@shared/const";
export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const EMBED_SESSION_CHANNEL = "pixel-jogos:embed-session";
export const SESSION_STORAGE_KEY = "manus-cookie";

export const requestEmbeddedStorageAccess = async () => {
  if (window.top === window.self) return false;
  const requestStorageAccess = (document as Document & {
    requestStorageAccess?: () => Promise<void>;
  }).requestStorageAccess;
  if (typeof requestStorageAccess !== "function") return false;
  try {
    await requestStorageAccess.call(document);
    return true;
  } catch {
    return false;
  }
};

export const storeEmbeddedSessionToken = (token: string) => {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, `${COOKIE_NAME}=${token}`);
    return true;
  } catch {
    return false;
  }
};

export const listenForEmbeddedSession = (onToken: (token: string) => void) => {
  if (window.top === window.self) return () => undefined;
  const handleMessage = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    const data = event.data as { type?: unknown; token?: unknown } | null;
    if (data?.type !== EMBED_SESSION_CHANNEL || typeof data.token !== "string" || data.token.length < 20) return;
    onToken(data.token);
  };
  window.addEventListener("message", handleMessage);
  const channel = typeof BroadcastChannel === "function" ? new BroadcastChannel(EMBED_SESSION_CHANNEL) : null;
  channel?.addEventListener("message", handleMessage);
  return () => {
    window.removeEventListener("message", handleMessage);
    channel?.close();
  };
};

export const broadcastEmbeddedSession = (token: string) => {
  const message = { type: EMBED_SESSION_CHANNEL, token };
  try {
    window.opener?.postMessage(message, window.location.origin);
  } catch {
    // The BroadcastChannel path below remains available when opener access is blocked.
  }
  if (typeof BroadcastChannel !== "function") return;
  const channel = new BroadcastChannel(EMBED_SESSION_CHANNEL);
  channel.postMessage(message);
  window.setTimeout(() => channel.close(), 1000);
};

export const relaySessionToEmbeddedFrame = async () => {
  if (!window.opener && typeof BroadcastChannel !== "function") return false;
  try {
    const response = await fetch("/api/oauth/embed-token", { credentials: "include", cache: "no-store" });
    if (!response.ok) return false;
    const payload = await response.json() as { token?: unknown };
    if (typeof payload.token !== "string") return false;
    broadcastEmbeddedSession(payload.token);
    return true;
  } catch {
    return false;
  }
};

export const startLogin = async () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;

  const nonce = crypto.randomUUID();
  document.cookie = `${OAUTH_STATE_COOKIE}=${nonce}; Path=/; Max-Age=600; SameSite=None; Secure`;
  const shouldReturnToGoogleSites = new URLSearchParams(window.location.search).get("returnTo") === "google-sites";
  const state = encodeOAuthState({
    redirectUri,
    nonce,
    returnTo: shouldReturnToGoogleSites ? GOOGLE_SITES_RETURN_URL : undefined,
  });

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  if (window.top !== window.self) {
    const storageAccessPromise = requestEmbeddedStorageAccess();
    const loginWindow = window.open(`${window.location.origin}/?login=1&returnTo=google-sites`, "_blank");
    await storageAccessPromise;
    if (!loginWindow) window.top?.location.assign(`${window.location.origin}/?login=1&returnTo=google-sites`);
    return;
  }

  window.location.href = url.toString();
};
