import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import {
  COOKIE_NAME,
  listenForEmbeddedSession,
  relaySessionToEmbeddedFrame,
  storeEmbeddedSessionToken,
} from "./const";

import "./index.css";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;
  if (error.message === UNAUTHED_ERR_MSG) {
    console.info("[Auth] Login required for this action.");
  }
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

if (typeof window !== "undefined") {
  listenForEmbeddedSession(token => {
    storeEmbeddedSessionToken(token);
    window.location.reload();
  });

  const params = new URLSearchParams(window.location.search);
  if (params.get("login") === "1" && params.get("returnTo") === "google-sites") {
    void relaySessionToEmbeddedFrame().then((sent: boolean) => {
      if (sent) window.close();
    });
  }
}

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      headers() {
        return {};
      },
      fetch(input, init) {
        const headers = new Headers(init?.headers);
        try {
          const storedCookie = sessionStorage.getItem("manus-cookie");
          const prefix = `${COOKIE_NAME}=`;
          if (storedCookie?.startsWith(prefix)) {
            headers.set("Authorization", `Bearer ${storedCookie.slice(prefix.length)}`);
          }
        } catch {
          // sessionStorage may be unavailable in restricted iframe contexts.
        }
        return globalThis.fetch(input, {
          ...(init ?? {}),
          headers,
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
