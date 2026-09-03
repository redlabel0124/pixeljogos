import { describe, expect, it, vi } from "vitest";
import { FREE_LIMIT_SECONDS, advanceFreeTimer, hasCatalogAccess, recoverTimerAfterPersistenceError, remainingFreeSeconds, resetLocalTimerAfterPersistenceError } from "../shared/planRules";

describe("plan access rules", () => {
  it("keeps paid plans available", () => {
    expect(hasCatalogAccess("monthly", FREE_LIMIT_SECONDS)).toBe(true);
    expect(hasCatalogAccess("annual", FREE_LIMIT_SECONDS)).toBe(true);
  });

  it("allows free access before the daily limit", () => {
    expect(hasCatalogAccess("free", FREE_LIMIT_SECONDS - 1)).toBe(true);
    expect(remainingFreeSeconds(120)).toBe(FREE_LIMIT_SECONDS - 120);
  });

  it("blocks free access at the daily limit and never goes negative", () => {
    expect(hasCatalogAccess("free", FREE_LIMIT_SECONDS)).toBe(false);
    expect(hasCatalogAccess("free", FREE_LIMIT_SECONDS + 100)).toBe(false);
    expect(remainingFreeSeconds(FREE_LIMIT_SECONDS + 100)).toBe(0);
    expect(remainingFreeSeconds(FREE_LIMIT_SECONDS)).toBe(0);
  });

  it("stops exactly at the limit and resets local time after persistence failure", () => {
    expect(advanceFreeTimer(3599, 0, 1)).toEqual({ nextLocalUsageSeconds: 1, shouldStop: true });
    expect(resetLocalTimerAfterPersistenceError()).toBe(0);
  });

  it("resets local usage and refetches the persisted profile after a write failure", async () => {
    const refetch = vi.fn().mockResolvedValue(undefined);
    await expect(recoverTimerAfterPersistenceError(refetch)).resolves.toBe(0);
    expect(refetch).toHaveBeenCalledOnce();
  });

  it("blocks users without a plan", () => {
    expect(hasCatalogAccess("none")).toBe(false);
  });
});
