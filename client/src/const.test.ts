import { afterEach, describe, expect, it, vi } from "vitest";
import { COOKIE_NAME, listenForEmbeddedSession, requestEmbeddedStorageAccess, startLogin, storeEmbeddedSessionToken } from "@/const";

describe("startLogin", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("abre uma segunda aba quando acionado dentro do Google Sites", async () => {
    vi.stubEnv("VITE_OAUTH_PORTAL_URL", "https://oauth.example.test");
    vi.stubEnv("VITE_APP_ID", "pixel-test");

    const open = vi.spyOn(window, "open").mockReturnValue({} as Window);
    const parentWindow = { location: { assign: vi.fn() } };
    Object.defineProperty(window, "top", {
      configurable: true,
      get: () => parentWindow,
    });

    await startLogin();

    expect(open).toHaveBeenCalledWith(
      `${window.location.origin}/?login=1&returnTo=google-sites`,
      "_blank"
    );
    expect(parentWindow.location.assign).not.toHaveBeenCalled();
  });

  it("não falha em documento de nível superior sem Storage Access API", async () => {
    await expect(requestEmbeddedStorageAccess()).resolves.toBe(false);
  });

  it("armazena o token de handoff no formato Bearer esperado pelo cliente", () => {
    expect(storeEmbeddedSessionToken("session-token-12345678901234567890")).toBe(true);
    expect(sessionStorage.getItem("manus-cookie")).toBe(`${COOKIE_NAME}=session-token-12345678901234567890`);
  });

  it("aceita somente mensagens de sessão same-origin no listener incorporado", () => {
    const onToken = vi.fn();
    const cleanup = listenForEmbeddedSession(onToken);
    window.dispatchEvent(new MessageEvent("message", { origin: "https://malicious.example", data: { type: "pixel-jogos:embed-session", token: "session-token-12345678901234567890" } }));
    expect(onToken).not.toHaveBeenCalled();
    cleanup();
  });
});
