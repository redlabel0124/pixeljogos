import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers.js";
import type { TrpcContext } from "./_core/context.js";

const dbMocks = vi.hoisted(() => ({
  getUserByOpenId: vi.fn(),
  activateUserPlan: vi.fn(),
  addDailyUsage: vi.fn(),
}));
vi.mock("./db", () => dbMocks);

function authenticatedContext(): TrpcContext {
  return {
    user: { id: 7, openId: "user-7", name: "Player", email: "player@example.com", loginMethod: "oauth", role: "user", plan: "none", planActivatedAt: null, dailyUsageDate: null, dailyUsageSeconds: 0, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("account success procedures", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the authenticated profile", async () => {
    dbMocks.getUserByOpenId.mockResolvedValue({ openId: "user-7", plan: "none" });
    await expect(appRouter.createCaller(authenticatedContext()).account.profile()).resolves.toEqual({ openId: "user-7", plan: "none" });
  });

  it("activates and returns the selected plan", async () => {
    dbMocks.activateUserPlan.mockResolvedValue({ openId: "user-7", plan: "monthly" });
    await expect(appRouter.createCaller(authenticatedContext()).account.activatePlan({ plan: "monthly" })).resolves.toEqual({ openId: "user-7", plan: "monthly" });
    expect(dbMocks.activateUserPlan).toHaveBeenCalledWith("user-7", "monthly");
  });

  it("records daily usage", async () => {
    dbMocks.addDailyUsage.mockResolvedValue({ dailyUsageSeconds: 45, remainingSeconds: 3555 });
    await expect(appRouter.createCaller(authenticatedContext()).account.addUsage({ seconds: 1 })).resolves.toEqual({ dailyUsageSeconds: 45, remainingSeconds: 3555 });
    expect(dbMocks.addDailyUsage).toHaveBeenCalledWith("user-7", 1);
  });
});
