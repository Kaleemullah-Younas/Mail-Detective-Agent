import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { prisma } from '@/lib/db';

export const investigationBatchRouter = router({
  getLatest: protectedProcedure.query(async ({ ctx }) => {
    return prisma.investigationBatch.findUnique({
      where: { userId: ctx.session.user.id },
    });
  }),

  save: protectedProcedure
    .input(
      z.object({
        classified: z.array(z.record(z.string(), z.unknown())),
        scored: z.array(z.record(z.string(), z.unknown())),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      return prisma.investigationBatch.upsert({
        where: { userId },
        create: {
          userId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          classified: input.classified as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          scored: input.scored as any,
        },
        update: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          classified: input.classified as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          scored: input.scored as any,
        },
      });
    }),

  clear: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      await prisma.investigationBatch.delete({
        where: { userId: ctx.session.user.id },
      });
    } catch {
      // Not found — already clear
    }
    return { ok: true };
  }),
});
