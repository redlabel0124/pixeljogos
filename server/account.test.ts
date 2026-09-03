import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function unauthenticatedContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("account protected procedures", () => {
  it("rejects profile access without a session", async () => {
    await expect(appRouter.createCaller(unauthenticatedContext()).account.profile()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects plan activation without a session", async () => {
    await expect(appRouter.createCaller(unauthenticatedContext()).account.activatePlan({ plan: "free" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects daily usage updates without a session", async () => {
    await expect(appRouter.createCaller(unauthenticatedContext()).account.addUsage({ seconds: 1 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
