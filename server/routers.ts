import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies.js";
import { systemRouter } from "./_core/systemRouter.js";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc.js";
import { sdk } from "./_core/sdk.js";
import {
  activateUserPlan,
  addDailyUsage,
  createEmailUser,
  getUserByEmail,
  getUserByOpenId,
  updateUserProfile,
} from "./db.js";
import { hashPassword, verifyPassword } from "./_core/password.js";
import { z } from "zod";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function validatePassword(password: string) {
  return password.length >= 8 && password.length <= 128;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    register: publicProcedure.input(z.object({
      name: z.string().trim().min(2, "Informe seu nome").max(80),
      email: z.string().trim().email("E-mail inválido").max(320),
      password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres").max(128),
    })).mutation(async ({ ctx, input }) => {
      const email = normalizeEmail(input.email);
      if (!validatePassword(input.password)) {
        throw new Error("A senha precisa ter entre 8 e 128 caracteres");
      }
      const existing = await getUserByEmail(email);
      if (existing) {
        throw new Error("Este e-mail já está cadastrado. Entre na sua conta.");
      }
      const passwordHash = await hashPassword(input.password);
      const user = await createEmailUser({ email, name: input.name.trim(), passwordHash });
      if (!user) throw new Error("Não foi possível criar a conta");
      const token = await sdk.createSessionToken(user.openId, { name: user.name ?? "", expiresInMs: ONE_YEAR_MS });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      return user;
    }),
    login: publicProcedure.input(z.object({
      email: z.string().trim().email("E-mail inválido").max(320),
      password: z.string().min(1, "Informe sua senha").max(128),
    })).mutation(async ({ ctx, input }) => {
      const email = normalizeEmail(input.email);
      const user = await getUserByEmail(email);
      if (!user?.passwordHash || !(await verifyPassword(input.password, user.passwordHash))) {
        throw new Error("E-mail ou senha incorretos.");
      }
      const token = await sdk.createSessionToken(user.openId, { name: user.name ?? "", expiresInMs: ONE_YEAR_MS });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      return user;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  account: router({
    profile: protectedProcedure.query(({ ctx }) => getUserByOpenId(ctx.user.openId)),
    updateProfile: protectedProcedure.input(z.object({ name: z.string().trim().min(1).max(80).optional(), avatarUrl: z.string().trim().url().max(2000).nullable().optional() })).mutation(({ ctx, input }) => updateUserProfile(ctx.user.openId, input)),
    activatePlan: protectedProcedure.input(z.object({ plan: z.enum(["free", "monthly", "annual"]) })).mutation(({ ctx, input }) => activateUserPlan(ctx.user.openId, input.plan)),
    addUsage: protectedProcedure.input(z.object({ seconds: z.number().int().min(0).max(60) })).mutation(({ ctx, input }) => addDailyUsage(ctx.user.openId, input.seconds)),
  }),
});

export type AppRouter = typeof appRouter;
