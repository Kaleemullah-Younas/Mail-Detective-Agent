import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { prisma } from '@/lib/db';

export const profileInputSchema = z.object({
  fullName: z.string().min(1, 'Name is required').max(120),
  avatarUrl: z.string().url().optional().nullable(),
  degreeProgram: z.string().min(1, 'Degree/program is required').max(120),
  university: z.string().max(160).optional().nullable(),
  semester: z.coerce
    .number()
    .int()
    .min(1, 'Semester must be 1 or higher')
    .max(16),
  cgpa: z.coerce.number().min(0).max(4),
  skills: z.array(z.string().min(1)).default([]),
  preferredOpportunityTypes: z.array(z.string().min(1)).default([]),
  financialNeed: z.boolean().default(false),
  locationPreference: z.string().max(160).optional().nullable(),
  pastExperience: z.string().max(2000).optional().nullable(),
  source: z.enum(['MANUAL', 'RESUME']).default('MANUAL'),
  resumeFileName: z.string().optional().nullable(),
  resumeRawText: z.string().optional().nullable(),
});

export type ProfileInput = z.infer<typeof profileInputSchema>;

export const profileRouter = router({
  me: protectedProcedure.query(({ ctx }) =>
    prisma.studentProfile.findUnique({
      where: { userId: ctx.session.user.id },
    })
  ),

  upsert: protectedProcedure
    .input(profileInputSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      return prisma.studentProfile.upsert({
        where: { userId },
        create: { ...input, userId },
        update: input,
      });
    }),
});
