export type AccessPlan = "none" | "free" | "monthly" | "annual";

export const FREE_LIMIT_SECONDS = 3600;

export function hasCatalogAccess(plan: AccessPlan, dailyUsageSeconds = 0) {
  return plan === "monthly" || plan === "annual" || (plan === "free" && dailyUsageSeconds < FREE_LIMIT_SECONDS);
}

export function remainingFreeSeconds(dailyUsageSeconds = 0) {
  return Math.max(0, FREE_LIMIT_SECONDS - Math.max(0, dailyUsageSeconds));
}

export function advanceFreeTimer(persistedUsageSeconds: number, localUsageSeconds: number, increment = 1) {
  const localLimit = remainingFreeSeconds(persistedUsageSeconds);
  const nextLocalUsageSeconds = Math.min(localLimit, Math.max(0, localUsageSeconds) + Math.max(0, increment));
  return { nextLocalUsageSeconds, shouldStop: nextLocalUsageSeconds >= localLimit };
}

export function resetLocalTimerAfterPersistenceError() {
  return 0;
}

export async function recoverTimerAfterPersistenceError(refetch: () => Promise<unknown> | unknown) {
  const localSeconds = resetLocalTimerAfterPersistenceError();
  await refetch();
  return localSeconds;
}
