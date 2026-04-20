import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../trpc';
import { prisma } from '@/lib/db';

const SaveInputSchema = z.object({
  emailId: z.string().min(1).max(200),
  from: z.string().default(''),
  subject: z.string().default(''),
  date: z.string().optional().nullable(),
  body: z.string().default(''),
  title: z.string().default(''),
  organisation: z.string().optional().nullable(),
  opportunityType: z.string().default('Other'),
  deadline: z.string().optional().nullable(),
  deadlineIso: z.string().optional().nullable(),
  eligibility: z.array(z.string()).default([]),
  requiredDocuments: z.array(z.string()).default([]),
  link: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  stipendOrValue: z.string().optional().nullable(),
  summary: z.string().default(''),
  score: z.number().int().min(0).max(100),
  urgencyScore: z.number().int().min(0).max(100),
  fitScore: z.number().int().min(0).max(100),
  eligibilityScore: z.number().int().min(0).max(100),
  effortRewardScore: z.number().int().min(0).max(100),
  verdict: z.string().default('CONSIDER'),
  reasoning: z.string().default(''),
  highlights: z.array(z.string()).default([]),
});

export const savedEmailRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const rows = await prisma.savedEmail.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: 'desc' },
    });
    return rows;
  }),

  ids: protectedProcedure.query(async ({ ctx }) => {
    const rows = await prisma.savedEmail.findMany({
      where: { userId: ctx.session.user.id },
      select: { emailId: true },
    });
    return rows.map(r => r.emailId);
  }),

  save: protectedProcedure
    .input(SaveInputSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      return prisma.savedEmail.upsert({
        where: { userId_emailId: { userId, emailId: input.emailId } },
        create: { ...input, userId },
        update: { ...input },
      });
    }),

  unsave: protectedProcedure
    .input(z.object({ emailId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      try {
        await prisma.savedEmail.delete({
          where: { userId_emailId: { userId, emailId: input.emailId } },
        });
        return { ok: true };
      } catch {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Email not in saved list',
        });
      }
    }),
});
