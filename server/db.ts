import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, Plan, users } from "../drizzle/schema.js";
import { ENV } from "./_core/env.js";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); }
    catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "avatarUrl", "loginMethod"] as const) {
    if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; }
  }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  values.lastSignedIn ??= new Date();
  updateSet.lastSignedIn ??= new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}

export async function createEmailUser(input: {
  email: string;
  name: string;
  passwordHash: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const openId = `email_${crypto.randomUUID()}`;
  await db.insert(users).values({
    openId,
    name: input.name,
    email: input.email,
    passwordHash: input.passwordHash,
    loginMethod: "email",
    lastSignedIn: new Date(),
  });
  return getUserByOpenId(openId);
}

export async function setEmailPassword(openId: string, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(users).set({ passwordHash, loginMethod: "email" }).where(eq(users.openId, openId));
  return getUserByOpenId(openId);
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function updateUserProfile(openId: string, profile: { name?: string; avatarUrl?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(users).set({
    ...(profile.name !== undefined ? { name: profile.name } : {}),
    ...(profile.avatarUrl !== undefined ? { avatarUrl: profile.avatarUrl } : {}),
  }).where(eq(users.openId, openId));
  return getUserByOpenId(openId);
}

export async function activateUserPlan(openId: string, plan: Exclude<Plan, "none">) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(users).set({ plan, planActivatedAt: new Date(), dailyUsageDate: null, dailyUsageSeconds: 0 }).where(eq(users.openId, openId));
  return getUserByOpenId(openId);
}

export async function addDailyUsage(openId: string, seconds: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const user = await getUserByOpenId(openId);
  if (!user) throw new Error("User not found");
  const today = new Date().toISOString().slice(0, 10);
  const current = user.dailyUsageDate === today ? user.dailyUsageSeconds : 0;
  const next = Math.min(3600, current + Math.max(0, Math.floor(seconds)));
  await db.update(users).set({ dailyUsageDate: today, dailyUsageSeconds: next }).where(eq(users.openId, openId));
  return { dailyUsageDate: today, dailyUsageSeconds: next, remainingSeconds: Math.max(0, 3600 - next) };
}
